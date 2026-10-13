// One-off: renders the gear GLBs to transparent PNG stills (dev server only).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const MODELS = [
  { file: "mpc_one.optimized.glb", fix: [Math.PI / 2, 0, 0], view: [-0.9, 0.35, 0] },
  { file: "arturia_minilab_mkii_model.optimized.glb", fix: [Math.PI / 2, 0, 0], view: [-0.85, 0.3, 0] },
  { file: "fl_studio_logo.optimized.glb", fix: [0, 0, 0], view: [0.05, -0.45, 0] },
  { file: "WAVES.optimized.glb", fix: [Math.PI / 2, 0, 0], view: [0.05, -0.35, 0] },
];

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000, 0);

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

window.renderAll = async () => {
  const out = [];
  for (const m of MODELS) {
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x221111, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-4, 8, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd9cc, 1.4); rim.position.set(6, 2, -6); scene.add(rim);
    const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 2000);
    const gltf = await loader.loadAsync(`/models/${m.file}`);
    const root = gltf.scene;
    root.rotation.set(...m.fix);
    const pivot = new THREE.Group(); pivot.add(root); scene.add(pivot);
    const box = new THREE.Box3().setFromObject(root);
    root.position.sub(box.getCenter(new THREE.Vector3()));
    pivot.rotation.set(...m.view);
    const sphere = new THREE.Box3().setFromObject(pivot).getBoundingSphere(new THREE.Sphere());
    const dist = sphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(0, 0, dist * 1.02); camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
    const res = await fetch(`/__save?name=${m.file.split(".")[0]}.png`, { method: "POST", body: blob });
    out.push(m.file + " " + res.status);
  }
  return out;
};

window.inspectMpc = async () => {
  const gltf = await loader.loadAsync(`/models/mpc_one.optimized.glb`);
  const rows = [];
  gltf.scene.traverse((o) => {
    if (o.isMesh) {
      const b = new THREE.Box3().setFromObject(o);
      const s = b.getSize(new THREE.Vector3());
      rows.push(`${o.name}|${o.material?.name}|${s.x.toFixed(3)},${s.y.toFixed(3)},${s.z.toFixed(3)}`);
    }
  });
  return rows;
};

window.renderMpcTop = async (rx = -Math.PI / 2, name = "mpc_top.png") => {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x332222, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 6, 9); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffe6dd, 0.8); fill.position.set(5, -2, 6); scene.add(fill);
  const gltf = await loader.loadAsync(`/models/mpc_one.optimized.glb`);
  const root = gltf.scene; root.rotation.set(Math.PI / 2, 0, 0);
  const pivot = new THREE.Group(); pivot.add(root); scene.add(pivot);
  root.position.sub(new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3()));
  pivot.rotation.set(rx, 0, 0);
  const b = new THREE.Box3().setFromObject(pivot); const s = b.getSize(new THREE.Vector3());
  const half = Math.max(s.x, s.y) / 2 * 1.02;
  const cam = new THREE.OrthographicCamera(-half, half, half, -half, 0.01, 100);
  cam.position.set(0, 0, 10); cam.lookAt(0, 0, 0);
  renderer.render(scene, cam);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
  return (await fetch(`/__save?name=${name}`, { method: "POST", body: blob })).status;
};
