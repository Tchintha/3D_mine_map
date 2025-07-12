// main.js - 3D Uranium Mine Model with Fly-through (Three.js)
let scene, camera, renderer, controls;
const labels = [];

init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcfd8dc);

  // Camera
  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 40, 120);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container').appendChild(renderer.domElement);

  // Controls (FlyControls)
  controls = new THREE.FlyControls(camera, renderer.domElement);
  controls.movementSpeed = 30;
  controls.rollSpeed = Math.PI / 12;
  controls.dragToLook = true;

  // Lighting
  const sun = new THREE.DirectionalLight(0xffffe0, 1.1);
  sun.position.set(100, 200, 80);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));

  // Terrain
  addDesertTerrain();
  // Open-pit mine
  addOpenPitMine();
  // Haul roads
  addHaulRoads();
  // Mining trucks
  addMiningTrucks();
  // Geological layers (strata)
  addGeologicalLayers();

  // Resize
  window.addEventListener('resize', onWindowResize);
}

function addDesertTerrain() {
  const geo = new THREE.PlaneGeometry(400, 400, 16, 16);
  for (let i = 0; i < geo.vertices?.length; i++) {
    geo.vertices[i].z = Math.random() * 1.2;
  }
  const mat = new THREE.MeshLambertMaterial({ color: 0xe2c290 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -7;
  scene.add(mesh);
}

function addOpenPitMine() {
  // Create concentric stepped cylinders for benches
  const pitCenter = new THREE.Vector3(0, 0, 0);
  const benches = 6;
  const baseRadius = 50;
  const benchHeight = 4;
  for (let i = 0; i < benches; i++) {
    const radius = baseRadius - i * 7.5;
    const height = benchHeight;
    const geo = new THREE.CylinderGeometry(radius, radius + 5, height, 48, 1, true);
    const mat = new THREE.MeshLambertMaterial({ color: 0x9e9e9e, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pitCenter);
    mesh.position.y = -i * benchHeight;
    scene.add(mesh);
  }
}

function addHaulRoads() {
  // Spiral road approximation
  const curve = new THREE.CurvePath();
  let angle = 0, y = 0;
  for (let i = 0; i < 6; i++) {
    const radius = 50 - i * 7.5 + 3;
    const arc = new THREE.ArcCurve(0, 0, radius, angle, angle + Math.PI * 0.75, false);
    const points = arc.getPoints(24);
    for (let j = 1; j < points.length; j++) {
      const seg = new THREE.LineCurve3(
        new THREE.Vector3(points[j - 1].x, y, points[j - 1].y),
        new THREE.Vector3(points[j].x, y - 4, points[j].y)
      );
      curve.add(seg);
      y -= 4 / points.length;
    }
    angle += Math.PI * 0.75;
  }
  const roadGeo = new THREE.TubeGeometry(curve, 120, 1.7, 8, false);
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x6d4c2f });
  const road = new THREE.Mesh(roadGeo, roadMat);
  scene.add(road);
}

function addMiningTrucks() {
  // Place a few low-poly trucks on benches/roads
  for (let i = 0; i < 4; i++) {
    const truck = createTruck();
    truck.position.set(
      30 * Math.cos(i * Math.PI / 2),
      -i * 4 + 2,
      30 * Math.sin(i * Math.PI / 2)
    );
    truck.rotation.y = Math.random() * Math.PI * 2;
    scene.add(truck);
  }
}

function createTruck() {
  const group = new THREE.Group();
  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(5, 2, 2.5),
    new THREE.MeshLambertMaterial({ color: 0xfbc02d })
  );
  body.position.y = 1.1;
  group.add(body);
  // Wheels
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 1, 10),
        new THREE.MeshLambertMaterial({ color: 0x333 })
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(i * 2, 0.4, j * 1);
      group.add(wheel);
    }
  }
  return group;
}

function addGeologicalLayers() {
  // Overburden
  const overburden = new THREE.Mesh(
    new THREE.CylinderGeometry(35, 40, 8, 32),
    new THREE.MeshLambertMaterial({ color: 0xdad7cb, transparent: true, opacity: 0.55 })
  );
  overburden.position.set(0, -28, 0);
  scene.add(overburden);
  labels.push({ text: 'Overburden', pos: new THREE.Vector3(0, -24, 36) });

  // Ore body
  const ore = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 22, 8, 32),
    new THREE.MeshLambertMaterial({ color: 0x7e5b1b, transparent: true, opacity: 0.7 })
  );
  ore.position.set(0, -36, 0);
  scene.add(ore);
  labels.push({ text: 'Ore Body', pos: new THREE.Vector3(0, -34, 22) });

  // Aquifer
  const aquifer = new THREE.Mesh(
    new THREE.CylinderGeometry(14, 16, 5, 32),
    new THREE.MeshLambertMaterial({ color: 0x3ec6f2, transparent: true, opacity: 0.45 })
  );
  aquifer.position.set(0, -43, 0);
  scene.add(aquifer);
  labels.push({ text: 'Aquifer', pos: new THREE.Vector3(0, -41, 14) });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update(0.018);
  renderer.render(scene, camera);
  updateLabels();
}

function updateLabels() {
  const labelsDiv = document.getElementById('labels');
  labelsDiv.innerHTML = '';
  labels.forEach(lab => {
    const pos = lab.pos.clone();
    pos.project(camera);
    if (pos.z > 1 || pos.z < -1) return; // Behind camera
    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
    const el = document.createElement('div');
    el.textContent = lab.text;
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.background = 'rgba(255,255,255,0.85)';
    el.style.padding = '2px 8px';
    el.style.borderRadius = '6px';
    el.style.fontWeight = 'bold';
    el.style.fontSize = '1em';
    el.style.color = '#2d3c4a';
    el.style.pointerEvents = 'none';
    labelsDiv.appendChild(el);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
