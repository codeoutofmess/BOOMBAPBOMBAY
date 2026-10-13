/* The landing's 3D revolver, as on the original site: it follows the mouse
   on desktop and the phone's tilt on mobile. three.js is loaded on demand so
   it never holds up the rest of the page, and the render loop only runs
   while the landing is on screen. */

const MODEL_URL = "/models/revolver.optimized.glb";


export async function initRevolver(canvas) {
  if (!canvas) return;

  const [THREE, { GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import("three"),
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/libs/meshopt_decoder.module.js"),
  ]);

  const mobile = innerWidth <= 768;
  const size = () => ({ w: canvas.clientWidth || innerWidth, h: canvas.clientHeight || innerHeight });

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(mobile ? 1 : Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mobile ? 42 : 40, 1, 0.01, 2000);
  scene.add(camera);
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  const key = new THREE.DirectionalLight(0xffffff, mobile ? 1.8 : 2.0);
  key.position.set(6, 8, 10);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffffff, mobile ? 0.9 : 1.0);
  rim.position.set(-10, 4, -6);
  scene.add(rim);

  const gunGroup = new THREE.Group();
  scene.add(gunGroup);
  const baseQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));

  const resize = () => {
    const { w, h } = size();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  // ---- input
  const mouse = { x: 0, y: 0 };
  const gyro = { beta: 45, gamma: 0 };

  if (!mobile) {
    addEventListener("mousemove", (e) => {
      mouse.x = (e.clientX / innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / innerHeight) * 2 + 1;
    });
  } else {
    const onOrient = (e) => {
      gyro.beta = e.beta || 0;
      gyro.gamma = e.gamma || 0;
    };
    const enableGyro = () => {
      const DOE = window.DeviceOrientationEvent;
      if (DOE && typeof DOE.requestPermission === "function") {
        DOE.requestPermission()
          .then((state) => state === "granted" && addEventListener("deviceorientation", onOrient))
          .catch(() => {});
      } else {
        addEventListener("deviceorientation", onOrient);
      }
    };
    canvas.closest(".landing")?.addEventListener("click", enableGyro, { once: true });
  }

  // ---- model
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(MODEL_URL);
  const gunRoot = gltf.scene;
  gunGroup.add(gunRoot);

  const box = new THREE.Box3().setFromObject(gunRoot);
  gunRoot.position.sub(box.getCenter(new THREE.Vector3()));
  const radius = box.getBoundingSphere(new THREE.Sphere()).radius || 1;
  const dist = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov) / 2);

  if (mobile) {
    // Original mobile framing: full size, nudged into the gap between the
    // description and LATEST DROPS.
    const camDist = dist * 1.08;
    camera.position.set(0, radius * 0.15, camDist);
    gunGroup.position.x = 0.0199 * camDist;
    gunGroup.position.y = -0.096 * camDist; // was -0.131; lifted to clear the larger latest-drop block
  } else {
    camera.position.set(0, radius * 0.2, dist * 1.1);
  }
  camera.lookAt(0, 0, 0);
  gunGroup.quaternion.copy(baseQuat);

  // ---- loop
  const target = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const aim = new THREE.Vector3();

  function frame() {
    if (mobile) {
      const rx = THREE.MathUtils.degToRad(THREE.MathUtils.clamp((gyro.beta - 45) * 0.12, -10, 10));
      const ry = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(gyro.gamma * 0.35, -20, 20));
      euler.set(rx, ry, 0);
    } else {
      aim.set(mouse.x * 1.2, mouse.y * 0.7, 0).normalize();
      euler.set(aim.y * 0.18, aim.x * 0.28, 0);
    }
    target.setFromEuler(euler).premultiply(baseQuat);
    gunGroup.quaternion.slerp(target, 0.08);
    renderer.render(scene, camera);
  }

  let raf = 0;
  const loop = () => {
    frame();
    raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf);
    if (entry.isIntersecting) raf = requestAnimationFrame(loop);
  }).observe(canvas);

  let lastW = innerWidth;
  addEventListener("resize", () => {
    // Phones fire resize for the address bar; only width changes matter.
    if (mobile && innerWidth === lastW) return;
    lastW = innerWidth;
    resize();
    frame();
  });

  frame();
  canvas.classList.add("is-ready");
}
