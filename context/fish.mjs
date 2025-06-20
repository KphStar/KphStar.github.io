import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.115.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.115.0/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.115.0/examples/jsm/loaders/STLLoader.js';
import { BufferGeometryUtils } from 'https://cdn.jsdelivr.net/npm/three@0.115.0/examples/jsm/utils/BufferGeometryUtils.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, -25, 80);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x181005);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 150;
controls.enableDamping = true;

// Lanterns setup
let geoms = [];
let pts = [
  new THREE.Vector2(0, 1.0),
  new THREE.Vector2(0.25, 1.0),
  new THREE.Vector2(0.25, 0.875),
  new THREE.Vector2(0.45, 0.875),
  new THREE.Vector2(0.45, 0.05)
];
geoms.push(new THREE.LatheBufferGeometry(pts, 20));
geoms.push(new THREE.CylinderBufferGeometry(0.1, 0.1, 0.05, 20));

const fullGeom = BufferGeometryUtils.mergeBufferGeometries(geoms);
const instGeom = new THREE.InstancedBufferGeometry().copy(fullGeom);

const num = 500;
const instPos = [], instSpeed = [], instLight = [];

for (let i = 0; i < num; i++) {
  instPos.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
  instSpeed.push(Math.random() * 0.25 + 1);
  instLight.push(Math.PI + (Math.PI * Math.random()), Math.random() + 5);
}

instGeom.setAttribute("instPos", new THREE.InstancedBufferAttribute(new Float32Array(instPos), 3));
instGeom.setAttribute("instSpeed", new THREE.InstancedBufferAttribute(new Float32Array(instSpeed), 1));
instGeom.setAttribute("instLight", new THREE.InstancedBufferAttribute(new Float32Array(instLight), 2));

const mat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uLight: { value: new THREE.Color("red").multiplyScalar(1.5) },
    uColor: { value: new THREE.Color("maroon").multiplyScalar(1) },
    uFire: { value: new THREE.Color(1, 0.75, 0) }
  },
  vertexShader: `
    uniform float uTime;
    attribute vec3 instPos;
    attribute float instSpeed;
    attribute vec2 instLight;
    varying vec2 vInstLight;
    varying float vY;

    void main() {
      vInstLight = instLight;
      vY = position.y;
      vec3 pos = position * 2.0;
      vec3 iPos = instPos * 200.0;
      iPos.xz += vec2(
        cos(instLight.x + instLight.y * uTime),
        sin(instLight.x + instLight.y * uTime * fract(sin(instLight.x)))
      );
      iPos.y = mod(iPos.y + 100.0 + (uTime * instSpeed), 200.0) - 100.0;
      pos += iPos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uLight;
    uniform vec3 uColor;
    uniform vec3 uFire;
    varying vec2 vInstLight;
    varying float vY;

    void main() {
      float t = vInstLight.x + (vInstLight.y * uTime * 10.0);
      float ts = sin(t * 3.14) * 0.5 + 0.5;
      float tc = cos(t * 2.7) * 0.5 + 0.5;
      float f = smoothstep(0.12, 0.12 + (ts + tc) * 0.25, vY);
      float li = (0.5 + smoothstep(0.0, 1.0, ts * ts + tc * tc) * 0.5);
      vec3 col = mix(uLight * li, uColor * (0.75 + li * 0.25), f);
      col = mix(col, uFire, step(vY, 0.05) * (0.75 + li * 0.25));
      gl_FragColor = vec4(col, 1.0);
    }
  `,
  side: THREE.DoubleSide
});

scene.add(new THREE.Mesh(instGeom, mat));

// Uniform storage
const oUs = [];

function loadAnimatedFish(url, scale, color, heightOffset = 0, timeOffset = 0) {
  const loader = new STLLoader();
  loader.load(url, objGeom => {
    const baseVector = new THREE.Vector3(50, 0, 0);
    const axis = new THREE.Vector3(0, 1, 0);
    const cPts = [];
    const cSegments = 6;
    const cStep = Math.PI * 2 / cSegments;

    for (let i = 0; i < cSegments; i++) {
      cPts.push(
        new THREE.Vector3().copy(baseVector)
          .applyAxisAngle(axis, cStep * i)
          .setY(THREE.MathUtils.randFloat(-10, 10) + heightOffset)
      );
    }

    const curve = new THREE.CatmullRomCurve3(cPts);
    curve.closed = true;

    const numPoints = 511;
    const cPoints = curve.getSpacedPoints(numPoints);
    const cObjects = curve.computeFrenetFrames(numPoints, true);

    const data = [];
    cPoints.forEach(v => data.push(v.x, v.y, v.z));
    cObjects.binormals.forEach(v => data.push(v.x, v.y, v.z));
    cObjects.normals.forEach(v => data.push(v.x, v.y, v.z));
    cObjects.tangents.forEach(v => data.push(v.x, v.y, v.z));

    const tex = new THREE.DataTexture(new Float32Array(data), numPoints + 1, 4, THREE.RGBFormat, THREE.FloatType);
    tex.magFilter = THREE.NearestFilter;

    objGeom.center();
    objGeom.rotateX(-Math.PI * 0.5);
    objGeom.scale(scale, scale, scale);

    const objBox = new THREE.Box3().setFromBufferAttribute(objGeom.getAttribute("position"));
    const objSize = new THREE.Vector3();
    objBox.getSize(objSize);

    const objUniforms = {
      uSpatialTexture: { value: tex },
      uTextureSize: { value: new THREE.Vector2(numPoints + 1, 4) },
      uTime: { value: 0 },
      uLengthRatio: { value: objSize.z / curve.cacheArcLengths[200] },
      uObjSize: { value: objSize },
      uTimeOffset: { value: timeOffset }
    };
    oUs.push(objUniforms);

    const objMat = new THREE.MeshBasicMaterial({ color, wireframe: true });
    objMat.onBeforeCompile = shader => {
      shader.uniforms.uSpatialTexture = objUniforms.uSpatialTexture;
      shader.uniforms.uTextureSize = objUniforms.uTextureSize;
      shader.uniforms.uTime = objUniforms.uTime;
      shader.uniforms.uLengthRatio = objUniforms.uLengthRatio;
      shader.uniforms.uObjSize = objUniforms.uObjSize;
      shader.uniforms.uTimeOffset = objUniforms.uTimeOffset;

      shader.vertexShader = `
        uniform sampler2D uSpatialTexture;
        uniform vec2 uTextureSize;
        uniform float uTime;
        uniform float uLengthRatio;
        uniform vec3 uObjSize;
        uniform float uTimeOffset;

        struct splineData {
          vec3 point;
          vec3 binormal;
          vec3 normal;
        };

        splineData getSplineData(float t){
          float step = 1. / uTextureSize.y;
          float halfStep = step * 0.5;
          splineData sd;
          sd.point    = texture2D(uSpatialTexture, vec2(t, step * 0. + halfStep)).rgb;
          sd.binormal = texture2D(uSpatialTexture, vec2(t, step * 1. + halfStep)).rgb;
          sd.normal   = texture2D(uSpatialTexture, vec2(t, step * 2. + halfStep)).rgb;
          return sd;
        }
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
          vec3 pos = position;
          float wStep = 1. / uTextureSize.x;
          float hWStep = wStep * 0.5;
          float d = pos.z / uObjSize.z;
          float t = fract((uTime * 0.1 + uTimeOffset) + (d * uLengthRatio));
          float numPrev = floor(t / wStep);
          float numNext = numPrev + 1.0;
          float tPrev = numPrev * wStep + hWStep;
          float tNext = numNext * wStep + hWStep;
          splineData splinePrev = getSplineData(tPrev);
          splineData splineNext = getSplineData(tNext);
          float f = (t - tPrev) / wStep;
          vec3 P = mix(splinePrev.point, splineNext.point, f);
          vec3 B = mix(splinePrev.binormal, splineNext.binormal, f);
          vec3 N = mix(splinePrev.normal, splineNext.normal, f);
          transformed = P + (N * pos.x) + (B * pos.y);
        `
      );
    };

    const obj = new THREE.Mesh(objGeom, objMat);
    scene.add(obj);
  });
}

// 🐋 Whale (offset 0.0), 🐟 Koi (offset 0.5)
loadAnimatedFish('/Assets/model/mobydock.stl', 4.5, 0x3399ff, 0, 0.0);
loadAnimatedFish('/Assets/model/fish.stl', 0.5, 0xff6600, 5, 5.0);

// Animate
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  controls.update();
  const t = clock.getElapsedTime();
  mat.uniforms.uTime.value = t;
  oUs.forEach(u => u.uTime.value = t);
  renderer.render(scene, camera);
});
