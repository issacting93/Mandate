// shaders/snow.js — Snow particle system for MapLibre GL JS CustomLayerInterface
import { get } from 'svelte/store';
import { blizzardSeverity } from '$lib/stores/game.js';

const SNOW_COUNT = 12000;
const DUST_COUNT = 3000;
const TOTAL = SNOW_COUNT + DUST_COUNT;

const VERT = `
  precision highp float;
  attribute vec3 a_pos;
  attribute float a_size;
  attribute float a_speed;
  attribute float a_wobble;
  attribute float a_opacity;
  attribute float a_type;

  uniform mat4 u_matrix;
  uniform float u_time;
  uniform float u_pitch;
  uniform float u_severity;

  varying float v_opacity;
  varying float v_type;
  varying float v_streak;

  void main() {
    float t = u_time;
    float sev = u_severity;

    float fallMul = 1.0 + sev * 2.5;
    float z = fract(a_pos.z - t * a_speed * 0.00012 * fallMul);

    float windBase = sin(t * 0.0004 + a_pos.x * 8000.0) * 0.000015;
    float windGust = sin(t * 0.0008 + a_pos.y * 5000.0) * 0.00004 * sev;
    float windConst = sev * 0.00006;
    float wobble = sin(t * 0.002 * a_wobble + a_pos.y * 12000.0) * 0.000008 * (1.0 + sev);

    vec2 merc = a_pos.xy + vec2(windBase + windGust + windConst + wobble, 0.0);
    float altitude = z * 0.003;

    gl_Position = u_matrix * vec4(merc, altitude, 1.0);

    float pitchScale = 1.0 + u_pitch * 0.008;
    float depthScale = 0.5 + z * 0.8;
    float sizeMul = 1.0 + sev * 0.8;
    gl_PointSize = a_size * pitchScale * sizeMul / depthScale;

    float fade = smoothstep(0.0, 0.05, z) * smoothstep(1.0, 0.85, z);
    float opMul = 1.0 + sev * 1.2;
    v_opacity = min(a_opacity * fade * opMul, 0.9);
    v_type = a_type;
    v_streak = sev;
  }
`;

const FRAG = `
  precision highp float;
  varying float v_opacity;
  varying float v_type;
  varying float v_streak;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float stretch = 1.0 + v_streak * 3.0;
    vec2 scaled = vec2(uv.x * stretch, uv.y);
    float d = length(scaled);

    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.12, d) * v_opacity;

    vec3 snowColor = vec3(0.92, 0.94, 0.98);
    vec3 dustColor = mix(vec3(0.95, 0.75, 0.45), vec3(0.88, 0.88, 0.92), v_streak);
    vec3 color = mix(snowColor, dustColor, v_type);

    gl_FragColor = vec4(color, alpha);
  }
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export function createSnowLayer(map3d, getCurrentView) {
  return {
    id: 'snow-particles',
    type: 'custom',
    renderingMode: '3d',

    onAdd(map, gl) {
      const prog = gl.createProgram();
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      this.program = prog;

      const cx = ((-73.935 + 180) / 360);
      const cyRad = (40.730 * Math.PI) / 180;
      const cy = (1 - Math.log(Math.tan(cyRad) + 1 / Math.cos(cyRad)) / Math.PI) / 2;
      const spread = 0.012;

      const data = new Float32Array(TOTAL * 6);
      const opacityData = new Float32Array(TOTAL);
      const typeData = new Float32Array(TOTAL);

      for (let i = 0; i < TOTAL; i++) {
        const isSnow = i < SNOW_COUNT;
        const off = i * 6;
        data[off]     = cx + (Math.random() - 0.5) * spread * 2;
        data[off + 1] = cy + (Math.random() - 0.5) * spread * 1.5;
        data[off + 2] = Math.random();
        data[off + 3] = isSnow ? 1.5 + Math.random() * 3.0 : 0.8 + Math.random() * 1.5;
        data[off + 4] = isSnow ? 0.6 + Math.random() * 0.8 : 0.2 + Math.random() * 0.4;
        data[off + 5] = 0.5 + Math.random() * 2.0;
        opacityData[i] = isSnow ? 0.25 + Math.random() * 0.45 : 0.10 + Math.random() * 0.20;
        typeData[i] = isSnow ? 0.0 : 1.0;
      }

      this.buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

      this.opBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.opBuf);
      gl.bufferData(gl.ARRAY_BUFFER, opacityData, gl.STATIC_DRAW);

      this.typeBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.typeBuf);
      gl.bufferData(gl.ARRAY_BUFFER, typeData, gl.STATIC_DRAW);

      this.uMatrix   = gl.getUniformLocation(prog, 'u_matrix');
      this.uTime     = gl.getUniformLocation(prog, 'u_time');
      this.uPitch    = gl.getUniformLocation(prog, 'u_pitch');
      this.uSeverity = gl.getUniformLocation(prog, 'u_severity');
      this.aPos      = gl.getAttribLocation(prog, 'a_pos');
      this.aSize     = gl.getAttribLocation(prog, 'a_size');
      this.aSpeed    = gl.getAttribLocation(prog, 'a_speed');
      this.aWobble   = gl.getAttribLocation(prog, 'a_wobble');
      this.aOp       = gl.getAttribLocation(prog, 'a_opacity');
      this.aType     = gl.getAttribLocation(prog, 'a_type');
    },

    render(gl, matrix) {
      if (getCurrentView && getCurrentView() !== 'map') return;
      const prog = this.program;
      gl.useProgram(prog);

      gl.uniformMatrix4fv(this.uMatrix, false, matrix);
      gl.uniform1f(this.uTime, performance.now());
      gl.uniform1f(this.uPitch, map3d.getPitch());
      gl.uniform1f(this.uSeverity, get(blizzardSeverity));

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
      gl.enableVertexAttribArray(this.aPos);
      gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(this.aSize);
      gl.vertexAttribPointer(this.aSize, 1, gl.FLOAT, false, 24, 12);
      gl.enableVertexAttribArray(this.aSpeed);
      gl.vertexAttribPointer(this.aSpeed, 1, gl.FLOAT, false, 24, 16);
      gl.enableVertexAttribArray(this.aWobble);
      gl.vertexAttribPointer(this.aWobble, 1, gl.FLOAT, false, 24, 20);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.opBuf);
      gl.enableVertexAttribArray(this.aOp);
      gl.vertexAttribPointer(this.aOp, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.typeBuf);
      gl.enableVertexAttribArray(this.aType);
      gl.vertexAttribPointer(this.aType, 1, gl.FLOAT, false, 0, 0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.POINTS, 0, TOTAL);

      if (!getCurrentView || getCurrentView() === 'map') map3d.triggerRepaint();
    },
  };
}
