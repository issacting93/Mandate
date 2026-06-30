#!/usr/bin/env node
/**
 * build-nyc.mjs — Download NYC (Manhattan) building footprints and export a
 * single merged .glb mesh with Draco compression.
 *
 * Usage:  node tools/build-nyc.mjs
 * Output: public/nyc.glb
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import earcut from 'earcut';
import { Document, NodeIO, Logger } from '@gltf-transform/core';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import { draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

// ── paths ──────────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public');
const OUT_PATH = resolve(OUT_DIR, 'nyc.glb');

// ── coordinate conversion ──────────────────────────────────────────────────────
const CENTER = [-73.935, 40.730];
const SCALE = 8000;

function lngLatToWorld(lng, lat) {
  return [
    (lng - CENTER[0]) * SCALE * Math.cos(CENTER[1] * Math.PI / 180),
    0, // y = ground
    -(lat - CENTER[1]) * SCALE,
  ];
}

// ── download / fallback ────────────────────────────────────────────────────────
const API_URL =
  "https://data.cityofnewyork.us/resource/qb5r-6dgf.geojson?$limit=50000&$where=borough='MN'";

async function downloadBuildings() {
  console.log('Downloading Manhattan building footprints …');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const features = json.features ?? json;
    console.log(`  ✓ ${features.length} buildings received`);
    return features;
  } catch (err) {
    clearTimeout(timeout);
    console.warn(`  ✗ Download failed (${err.message}), using procedural fallback`);
    return generateFallbackBuildings();
  }
}

function generateFallbackBuildings(count = 500) {
  console.log(`  Generating ${count} random box buildings …`);
  // Manhattan rough bounding box
  const lngMin = -74.02, lngMax = -73.91;
  const latMin = 40.70, latMax = 40.80;
  const features = [];

  for (let i = 0; i < count; i++) {
    const lng = lngMin + Math.random() * (lngMax - lngMin);
    const lat = latMin + Math.random() * (latMax - latMin);
    const w = 0.0002 + Math.random() * 0.0004; // ~15–45m
    const h = 0.0001 + Math.random() * 0.0003;
    const height = 10 + Math.random() * 150;

    features.push({
      type: 'Feature',
      properties: { heightroof: height },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lng, lat],
          [lng + w, lat],
          [lng + w, lat + h],
          [lng, lat + h],
          [lng, lat],
        ]],
      },
    });
  }
  return features;
}

// ── geometry helpers ───────────────────────────────────────────────────────────

/**
 * Extrude one polygon ring into a watertight solid (floor + roof + walls).
 * Pushes into the provided allPositions / allIndices arrays.
 */
function extrudeBuilding(ring, height, allPositions, allIndices) {
  const n = ring.length;
  if (n < 3) return;

  // Convert ring to world-space 3D and prepare 2D for earcut
  const ws = []; // [[x,y,z], …]
  const flat2d = []; // [x,z,x,z, …]

  for (const coord of ring) {
    const [x, , z] = lngLatToWorld(coord[0], coord[1]);
    ws.push([x, z]);
    flat2d.push(x, z);
  }

  // Triangulate the footprint (floor / roof)
  const triIndices = earcut(flat2d, null, 2);
  if (triIndices.length === 0) return; // degenerate polygon

  const baseIdx = allPositions.length / 3;

  // ── floor vertices (y = 0) ──
  for (const [x, z] of ws) {
    allPositions.push(x, 0, z);
  }
  // ── roof vertices (y = height) ──
  for (const [x, z] of ws) {
    allPositions.push(x, height, z);
  }

  // floor triangles (wound CW looking down → face downward)
  for (let i = 0; i < triIndices.length; i += 3) {
    allIndices.push(
      baseIdx + triIndices[i + 2],
      baseIdx + triIndices[i + 1],
      baseIdx + triIndices[i],
    );
  }
  // roof triangles (wound CCW looking down → face upward)
  for (let i = 0; i < triIndices.length; i += 3) {
    allIndices.push(
      baseIdx + n + triIndices[i],
      baseIdx + n + triIndices[i + 1],
      baseIdx + n + triIndices[i + 2],
    );
  }

  // ── wall quads ──
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    // Each wall quad = 4 new vertices (for flat shading normals later)
    const wi = baseIdx + i;
    const wj = baseIdx + j;
    const ri = baseIdx + n + i;
    const rj = baseIdx + n + j;

    // Two triangles per quad (CCW when viewed from outside)
    allIndices.push(wi, wj, rj);
    allIndices.push(wi, rj, ri);
  }
}

// ── ground plane ───────────────────────────────────────────────────────────────
function addGroundPlane(allPositions, allIndices) {
  const S = 60; // half-size in world units — covers Manhattan
  const baseIdx = allPositions.length / 3;
  const Y = -0.05; // slightly below ground to avoid z-fight

  allPositions.push(-S, Y, -S);
  allPositions.push(S, Y, -S);
  allPositions.push(S, Y, S);
  allPositions.push(-S, Y, S);

  allIndices.push(baseIdx, baseIdx + 1, baseIdx + 2);
  allIndices.push(baseIdx, baseIdx + 2, baseIdx + 3);
}

// ── main ───────────────────────────────────────────────────────────────────────
async function main() {
  const t0 = performance.now();

  // 1. Download or fallback
  const features = await downloadBuildings();

  // 2. Extrude all buildings into merged arrays
  console.log('Extruding buildings …');
  const allPositions = [];
  const allIndices = [];
  let skipped = 0;

  for (const feat of features) {
    try {
      const geom = feat.geometry;
      if (!geom) { skipped++; continue; }

      // Support Polygon and MultiPolygon
      const polys = geom.type === 'MultiPolygon'
        ? geom.coordinates
        : [geom.coordinates];

      const height = parseFloat(feat.properties?.heightroof) || 15;
      // Convert feet to metres (NYC data is in feet)
      const heightM = height * 0.3048;

      for (const poly of polys) {
        const ring = poly[0]; // exterior ring
        if (!ring || ring.length < 4) { skipped++; continue; }
        // Drop closing duplicate if present
        const cleaned =
          ring[0][0] === ring[ring.length - 1][0] &&
          ring[0][1] === ring[ring.length - 1][1]
            ? ring.slice(0, -1)
            : ring;
        extrudeBuilding(cleaned, heightM, allPositions, allIndices);
      }
    } catch {
      skipped++;
    }
  }

  // 3. Ground plane
  addGroundPlane(allPositions, allIndices);

  console.log(
    `  ${features.length - skipped} buildings extruded, ${skipped} skipped`,
  );
  console.log(
    `  ${(allPositions.length / 3).toLocaleString()} vertices, ${(allIndices.length / 3).toLocaleString()} triangles`,
  );

  // 4. Build glTF Document
  console.log('Building glTF document …');

  const positions = new Float32Array(allPositions);
  const indices = new Uint32Array(allIndices);

  const doc = new Document();
  doc.setLogger(new Logger(Logger.Verbosity.WARN));

  const buffer = doc.createBuffer();

  const posAccessor = doc
    .createAccessor('positions')
    .setType('VEC3')
    .setArray(positions)
    .setBuffer(buffer);

  const idxAccessor = doc
    .createAccessor('indices')
    .setType('SCALAR')
    .setArray(indices)
    .setBuffer(buffer);

  const material = doc
    .createMaterial('buildings')
    .setBaseColorFactor([0.75, 0.72, 0.68, 1.0]) // warm stone
    .setMetallicFactor(0.0)
    .setRoughnessFactor(0.9);

  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', posAccessor)
    .setIndices(idxAccessor)
    .setMaterial(material);

  const mesh = doc.createMesh('nyc').addPrimitive(prim);
  const node = doc.createNode('nyc').setMesh(mesh);
  const scene = doc.createScene('scene').addChild(node);

  // 5. Apply Draco compression
  console.log('Applying Draco compression …');
  doc.createExtension(KHRDracoMeshCompression).setRequired(true);
  await doc.transform(
    draco({
      ...await getDracoOptions(),
      quantizePosition: 14,
    }),
  );

  // 6. Write GLB
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies({
      'draco3d.encoder': await draco3d.createEncoderModule(),
      'draco3d.decoder': await draco3d.createDecoderModule(),
    });

  const glb = await io.writeBinary(doc);
  writeFileSync(OUT_PATH, Buffer.from(glb));

  const sizeMB = (glb.byteLength / 1024 / 1024).toFixed(2);
  const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
  console.log(`Done: ${OUT_PATH}  (${sizeMB} MB, ${elapsed}s)`);
}

async function getDracoOptions() {
  return {
    method: 'edgebreaker',
    encodeSpeed: 5,
    decodeSpeed: 5,
  };
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
