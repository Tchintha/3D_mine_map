// THREE is available globally from CDN
const { GLTFExporter } = THREE;

// === SCENE SETUP ===
let scene, camera, renderer, controls, raycaster, mouse, tooltip, selectedObject;
let terrain, pitBenches = [], haulRoads = [], trucks = [], drillRigs = [], stockpiles = [], pipelines = [], geoLayers = {};
let miningMethod = 'openpit';
const clock = new THREE.Clock();

const canvas = document.getElementById('three-canvas');
const tooltipDiv = document.getElementById('tooltip');

init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe6e2d3);

  // Camera
  camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
  camera.position.set(0, 80, 180);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  // Lighting
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(120, 200, 100);
  sun.castShadow = true;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  // Raycaster for tooltips
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Terrain
  terrain = createTerrain();
  scene.add(terrain);

  // Pit benches
  createPitBenches();
  pitBenches.forEach(b => scene.add(b));

  // Haul roads
  createHaulRoads();
  haulRoads.forEach(r => scene.add(r));

  // Trucks
  createTrucks();
  trucks.forEach(t => scene.add(t));

  // Drill rigs
  createDrillRigs();
  drillRigs.forEach(d => scene.add(d));

  // Stockpiles
  createStockpiles();
  stockpiles.forEach(s => scene.add(s));

  // Pipelines
  createPipelines();
  pipelines.forEach(p => scene.add(p));

  // Geological layers
  createGeoLayers();
  Object.values(geoLayers).forEach(l => scene.add(l));

  // Controls
  setupControls();

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('click', onClick);

  // UI controls
  setupUI();
}

function createTerrain() {
  // Simple heightfield terrain
  const size = 400, segments = 64;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const x = geometry.attributes.position.getX(i);
    const y = geometry.attributes.position.getY(i);
    let h = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 3 + Math.random() * 1.5;
    if (Math.abs(x) < 80 && Math.abs(y) < 80) h -= 8 * Math.exp(-0.0007 * (x * x + y * y)); // pit depression
    geometry.attributes.position.setZ(i, h);
  }
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color: 0xe6d3b3, flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -8;
  mesh.receiveShadow = true;
  mesh.name = 'Terrain';
  return mesh;
}

function createPitBenches() {
  pitBenches.length = 0;
  const benches = 7, baseRadius = 60, benchHeight = 4;
  for (let i = 0; i < benches; i++) {
    const radius = baseRadius - i * 7.5;
    const geometry = new THREE.CylinderGeometry(radius, radius + 5, benchHeight, 64, 1, true);
    const material = new THREE.MeshStandardMaterial({ color: 0xc2b280, side: THREE.DoubleSide });
    const bench = new THREE.Mesh(geometry, material);
    bench.position.set(0, -i * benchHeight, 0);
    bench.castShadow = true;
    bench.receiveShadow = true;
    bench.name = `Pit Bench ${i+1}`;
    pitBenches.push(bench);
  }
}

function createHaulRoads() {
  haulRoads.length = 0;
  const points = [], segments = 180;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 4.2;
    const radius = 65 - t * 38;
    const y = -t * 24;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    ));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 120, 2.2, 10, false);
  const material = new THREE.MeshStandardMaterial({ color: 0x8b6f3f });
  const road = new THREE.Mesh(geometry, material);
  road.castShadow = true;
  road.receiveShadow = true;
  road.name = 'Haul Road';
  haulRoads.push(road);
}

function createTrucks() {
  trucks.length = 0;
  for (let i = 0; i < 4; i++) {
    const truck = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(7, 2.5, 3),
      new THREE.MeshStandardMaterial({ color: 0xf6c700 })
    );
    body.position.y = 1.3;
    truck.add(body);
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.5, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x8b6f3f })
    );
    cab.position.set(2.5, 2, 0);
    truck.add(cab);
    for (let w = 0; w < 6; w++) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 1, 12),
        new THREE.MeshStandardMaterial({ color: 0x222 })
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(-2 + (w > 3 ? 2.5 : w > 1 ? 1 : -2), 0.7, w % 2 === 0 ? -1.2 : 1.2);
      truck.add(wheel);
    }
    const angle = i * Math.PI * 0.5;
    const radius = 40 - i * 7;
    truck.position.set(Math.cos(angle) * radius, 2 - i * 4, Math.sin(angle) * radius);
    truck.rotation.y = angle + Math.PI / 2;
    truck.name = `Haul Truck ${i+1}`;
    trucks.push(truck);
  }
}

function createDrillRigs() {
  drillRigs.length = 0;
  for (let i = 0; i < 2; i++) {
    const rig = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x888 })
    );
    base.position.y = 0.3;
    rig.add(base);
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x444 })
    );
    mast.position.y = 3.5;
    rig.add(mast);
    rig.position.set(-30 + i * 60, 0, 30 - i * 60);
    rig.name = `Drill Rig ${i+1}`;
    drillRigs.push(rig);
  }
}

function createStockpiles() {
  stockpiles.length = 0;
  for (let i = 0; i < 2; i++) {
    const pile = new THREE.Mesh(
      new THREE.ConeGeometry(8, 5, 16),
      new THREE.MeshStandardMaterial({ color: 0xc2b280 })
    );
    pile.position.set(60 - i * 120, 2.5, 40 - i * 80);
    pile.name = `Ore Stockpile ${i+1}`;
    stockpiles.push(pile);
  }
}

function createPipelines() {
  pipelines.length = 0;
  for (let i = 0; i < 2; i++) {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 60, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e90ff, metalness: 0.5, roughness: 0.3 })
    );
    pipe.position.set(-40 + i * 80, -20, -60 + i * 120);
    pipe.rotation.z = Math.PI / 2;
    pipe.name = `Leaching Pipeline ${i+1}`;
    pipelines.push(pipe);
  }
}

function createGeoLayers() {
  geoLayers = {};
  // Topsoil
  geoLayers.topsoil = new THREE.Mesh(
    new THREE.CylinderGeometry(55, 60, 2, 48),
    new THREE.MeshStandardMaterial({ color: 0x9b7653, transparent: true, opacity: 0.7 })
  );
  geoLayers.topsoil.position.set(0, 1, 0);
  geoLayers.topsoil.name = 'Topsoil';
  // Overburden
  geoLayers.overburden = new THREE.Mesh(
    new THREE.CylinderGeometry(45, 55, 8, 48),
    new THREE.MeshStandardMaterial({ color: 0xd2b48c, transparent: true, opacity: 0.5 })
  );
  geoLayers.overburden.position.set(0, -4, 0);
  geoLayers.overburden.name = 'Overburden';
  // Uranium Ore
  geoLayers.ore = new THREE.Mesh(
    new THREE.CylinderGeometry(25, 35, 10, 48),
    new THREE.MeshStandardMaterial({ color: 0x7cfc00, transparent: true, opacity: 0.6 })
  );
  geoLayers.ore.position.set(0, -12, 0);
  geoLayers.ore.name = 'Uranium Ore';
  // Aquifer
  geoLayers.aquifer = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 30, 6, 48),
    new THREE.MeshStandardMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.4 })
  );
  geoLayers.aquifer.position.set(0, -18, 0);
  geoLayers.aquifer.name = 'Aquifer';
}

function setupControls() {
  // Simple orbit/fly controls
  let isDragging = false, prevX, prevY, phi = 0, theta = 0, dist = 180;
  function updateCamera() {
    camera.position.x = dist * Math.sin(phi) * Math.cos(theta);
    camera.position.z = dist * Math.cos(phi) * Math.cos(theta);
    camera.position.y = dist * Math.sin(theta) + 60;
    camera.lookAt(0, 0, 0);
  }
  updateCamera();
  canvas.addEventListener('mousedown', e => {
    if (e.button === 2) { isDragging = true; prevX = e.clientX; prevY = e.clientY; }
  });
  window.addEventListener('mousemove', e => {
    if (isDragging) {
      phi -= (e.clientX - prevX) * 0.008;
      theta -= (e.clientY - prevY) * 0.008;
      theta = Math.max(-Math.PI/2+0.1, Math.min(Math.PI/2-0.1, theta));
      prevX = e.clientX; prevY = e.clientY;
      updateCamera();
    }
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('wheel', e => {
    dist = Math.max(40, Math.min(400, dist + e.deltaY * 0.2));
    updateCamera();
  });
}

function setupUI() {
  // Layer toggles
  [
    ['toggleTopsoil', 'topsoil'],
    ['toggleOverburden', 'overburden'],
    ['toggleOre', 'ore'],
    ['toggleAquifer', 'aquifer'],
    ['togglePipelines', pipelines],
    ['toggleTrucks', trucks],
    ['toggleDrillRigs', drillRigs],
    ['toggleStockpiles', stockpiles],
  ].forEach(([id, obj]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.onchange = () => {
      if (Array.isArray(obj)) obj.forEach(o => o.visible = el.checked);
      else geoLayers[obj].visible = el.checked;
    };
  });
  // Mining method switcher
  const miningMethodSel = document.getElementById('miningMethod');
  miningMethodSel.onchange = () => {
    miningMethod = miningMethodSel.value;
    updateMiningMethod();
  };
  // Export
  document.getElementById('exportBtn').onclick = exportGLTF;
}

function updateMiningMethod() {
  // Open-pit: show pit, benches, trucks, roads, stockpiles, drill rigs
  // In-situ: hide pit/benches, show pipelines, aquifer, drill rigs
  const openPit = miningMethod === 'openpit';
  pitBenches.forEach(b => b.visible = openPit);
  haulRoads.forEach(r => r.visible = openPit);
  trucks.forEach(t => t.visible = openPit);
  stockpiles.forEach(s => s.visible = openPit);
  geoLayers.topsoil.visible = true;
  geoLayers.overburden.visible = openPit;
  geoLayers.ore.visible = true;
  geoLayers.aquifer.visible = true;
  pipelines.forEach(p => p.visible = !openPit);
  drillRigs.forEach(d => d.visible = true);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  updateTooltip();
  updateDataPanel();
}

function onWindowResize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

function onMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onClick(event) {
  // For future: select object, show more info
}

function updateTooltip() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([
    ...pitBenches, ...haulRoads, ...trucks, ...drillRigs, ...stockpiles, ...pipelines, ...Object.values(geoLayers)
  ], true);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    tooltipDiv.style.display = 'block';
    tooltipDiv.style.left = (mouse.x * 0.5 + 0.5) * canvas.clientWidth + 'px';
    tooltipDiv.style.top = (-mouse.y * 0.5 + 0.5) * canvas.clientHeight + 'px';
    tooltipDiv.innerHTML = `<b>${obj.name || obj.parent?.name || 'Mine Feature'}</b>`;
  } else {
    tooltipDiv.style.display = 'none';
  }
}

function updateDataPanel() {
  // Example: update with dummy data
  document.getElementById('mineDepth').textContent = '65 m';
  document.getElementById('uraniumConc').textContent = '350 ppm';
  document.getElementById('envImpact').textContent = miningMethod === 'openpit' ? 'Moderate' : 'Low';
}

function exportGLTF() {
  const exporter = new GLTFExporter();
  exporter.parse(scene, function (gltf) {
    const blob = new Blob([
      gltf instanceof ArrayBuffer ? gltf : JSON.stringify(gltf)
    ], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = miningMethod + '_uranium_mine.glb';
    a.click();
  }, { binary: true });
}
