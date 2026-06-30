// three/scene.js — Three.js scene manager for the NYC 3D map background
// Replaces MapLibre GL JS with a static .glb model

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// ── Coordinate system ──
// Center on NYC. 1 degree ≈ 8000 units ≈ 1 unit per ~10m
const CENTER_LNG = -73.935;
const CENTER_LAT = 40.730;
const SCALE = 8000;
const COS_LAT = Math.cos(CENTER_LAT * Math.PI / 180);

export function lngLatToWorld(lng, lat) {
  return new THREE.Vector3(
    (lng - CENTER_LNG) * SCALE * COS_LAT,
    0,
    -(lat - CENTER_LAT) * SCALE
  );
}

// ── Overview camera defaults ──
const OVERVIEW = {
  pitch: 52,    // degrees from horizontal
  bearing: -12, // degrees rotation
  distance: 600, // camera distance from center
  target: new THREE.Vector3(0, 0, 0),
};

// ── Camera position from pitch/bearing/distance ──
function cameraFromOrbit(pitch, bearing, distance, target) {
  const pitchRad = pitch * Math.PI / 180;
  const bearingRad = bearing * Math.PI / 180;
  const y = distance * Math.sin(pitchRad);
  const horiz = distance * Math.cos(pitchRad);
  const x = target.x + horiz * Math.sin(bearingRad);
  const z = target.z + horiz * Math.cos(bearingRad);
  return new THREE.Vector3(x, y, z);
}

export function createScene(container) {
  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x0a0a0f, 1);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;

  const rect = container.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height);
  container.appendChild(renderer.domElement);

  // ── Camera ──
  const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 1, 5000);
  const overviewPos = cameraFromOrbit(OVERVIEW.pitch, OVERVIEW.bearing, OVERVIEW.distance, OVERVIEW.target);
  camera.position.copy(overviewPos);
  camera.lookAt(OVERVIEW.target);

  // ── Scene ──
  const scene = new THREE.Scene();

  // ── Fog (driven by blizzard severity) ──
  scene.fog = new THREE.FogExp2(0x0a0a0f, 0.0008);

  // ── Lights ──
  // Ambient provides base visibility; directional gives shape to buildings
  const ambient = new THREE.AmbientLight(0x8888aa, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xccccdd, 1.2);
  dirLight.position.set(200, 400, 100);
  scene.add(dirLight);

  // Subtle fill from below for that noir uplighting feel
  const fillLight = new THREE.DirectionalLight(0x1a1a3a, 0.3);
  fillLight.position.set(-100, -50, -100);
  scene.add(fillLight);

  // ── Ground plane ──
  const groundGeo = new THREE.PlaneGeometry(2000, 2000);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 1 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.1;
  scene.add(ground);

  // ── Water plane (slightly different shade) ──
  const waterGeo = new THREE.PlaneGeometry(2000, 2000);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x0d1117, roughness: 0.8 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -0.2;
  scene.add(water);

  // ── Building material (severity-driven frost) ──
  let buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a3a,
    emissive: 0x111118,
    emissiveIntensity: 0.5,
    roughness: 0.8,
    metalness: 0.15,
  });

  const darkColor = new THREE.Color(0x2a2a3a);
  const frostColor = new THREE.Color(0xaaaabc);

  // ── Load .glb model ──
  let modelLoaded = false;
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  const loadPromise = new Promise((resolve) => {
    gltfLoader.load(
      '/nyc.glb',
      (gltf) => {
        let meshCount = 0;
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material = buildingMaterial;
            child.castShadow = false;
            child.receiveShadow = false;
            meshCount++;
          }
        });
        scene.add(gltf.scene);
        modelLoaded = true;
        console.log(`[scene] GLB loaded: ${meshCount} meshes`);
        resolve(true);
      },
      undefined,
      (err) => {
        console.warn('Failed to load nyc.glb, generating procedural fallback', err);
        generateFallbackBuildings();
        modelLoaded = true;
        resolve(false);
      }
    );
  });

  // ── Fallback: procedural buildings if .glb missing ──
  function generateFallbackBuildings() {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const merged = new THREE.InstancedMesh(geo, buildingMaterial, 800);

    const matrix = new THREE.Matrix4();
    const rng = (seed) => {
      let s = seed;
      return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    };
    const rand = rng(42);

    for (let i = 0; i < 800; i++) {
      const lng = CENTER_LNG + (rand() - 0.5) * 0.08;
      const lat = CENTER_LAT + (rand() - 0.5) * 0.06;
      const pos = lngLatToWorld(lng, lat);
      const h = 2 + rand() * 40;
      const w = 1 + rand() * 3;
      const d = 1 + rand() * 3;
      matrix.makeScale(w, h, d);
      matrix.setPosition(pos.x, h / 2, pos.z);
      merged.setMatrixAt(i, matrix);
    }
    merged.instanceMatrix.needsUpdate = true;
    scene.add(merged);
  }

  // ── Camera animation ──
  let animating = false;
  let animStart = 0;
  let animDuration = 0;
  let animFromPos = new THREE.Vector3();
  let animToPos = new THREE.Vector3();
  let animFromTarget = new THREE.Vector3();
  let animToTarget = new THREE.Vector3();

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function flyTo(lngLat, opts = {}) {
    const zoom = opts.zoom || 14.5;
    const pitch = opts.pitch || 60;
    const bearing = opts.bearing || (-20 + Math.random() * 40);
    const duration = opts.duration || 1800;

    const target = lngLatToWorld(lngLat[0], lngLat[1]);
    const dist = 80; // closer for detail view
    const pos = cameraFromOrbit(pitch, bearing, dist, target);

    animFromPos.copy(camera.position);
    animFromTarget.copy(OVERVIEW.target);
    // Compute current lookAt target (approximate)
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    animFromTarget.copy(camera.position).add(dir.multiplyScalar(100));

    animToPos.copy(pos);
    animToTarget.copy(target);
    animStart = performance.now();
    animDuration = duration;
    animating = true;
  }

  function flyToOverview(duration = 1400) {
    animFromPos.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    animFromTarget.copy(camera.position).add(dir.multiplyScalar(100));

    animToPos.copy(cameraFromOrbit(OVERVIEW.pitch, OVERVIEW.bearing, OVERVIEW.distance, OVERVIEW.target));
    animToTarget.copy(OVERVIEW.target);
    animStart = performance.now();
    animDuration = duration;
    animating = true;
  }

  // ── Severity-driven effects ──
  const fogDarkColor = new THREE.Color(0x1a1a2e);
  const fogLightColor = new THREE.Color(0x56513c);

  function setSeverity(severity) {
    // Fog thickens with severity
    scene.fog.color.lerpColors(fogDarkColor, fogLightColor, severity);
    scene.fog.density = 0.0008 + severity * 0.002;

    // Building frost
    buildingMaterial.color.lerpColors(darkColor, frostColor, severity * 0.7);

    // Ambient brightens in storms (whiteout effect)
    ambient.intensity = 0.6 + severity * 0.4;
  }

  // ── Render loop ──
  let running = true;
  let onFrameCallbacks = [];

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    // Camera animation
    if (animating) {
      const elapsed = performance.now() - animStart;
      const t = Math.min(1, elapsed / animDuration);
      const e = easeInOutCubic(t);

      camera.position.lerpVectors(animFromPos, animToPos, e);
      const target = new THREE.Vector3().lerpVectors(animFromTarget, animToTarget, e);
      camera.lookAt(target);

      if (t >= 1) animating = false;
    }

    // Per-frame callbacks (snow, etc.)
    for (const cb of onFrameCallbacks) cb();

    renderer.render(scene, camera);
  }
  animate();

  // ── Resize handling ──
  function handleResize() {
    const r = container.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    renderer.setSize(r.width, r.height);
  }
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);

  // ── Public API ──
  return {
    renderer,
    camera,
    scene,
    loadPromise,
    flyTo,
    flyToOverview,
    setSeverity,
    lngLatToWorld,

    onFrame(cb) {
      onFrameCallbacks.push(cb);
    },

    getPitch() {
      // Approximate pitch from camera angle
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      return Math.asin(-dir.y) * 180 / Math.PI;
    },

    dispose() {
      running = false;
      resizeObserver.disconnect();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      dracoLoader.dispose();
    },
  };
}
