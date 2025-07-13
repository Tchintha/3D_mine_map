// Initialize Three.js scenes and animations
class UraniumMiningExperience {
    constructor() {
        this.scenes = {};
        this.currentSection = 'hero';
        this.isAnimating = false;
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupNavigation();
        this.setupInteractiveElements();
        this.initialize3DScenes();
        this.setupGSAPAnimations();
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    this.currentSection = entry.target.id;
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // Mobile menu toggle
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }

    setupInteractiveElements() {
        // Mining method tabs
        const methodTabs = document.querySelectorAll('.method-tab');
        methodTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                methodTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.updateExtractionModel(tab.dataset.method);
            });
        });

        // Processing steps
        const processingSteps = document.querySelectorAll('.step');
        const stageInfos = document.querySelectorAll('.stage-info');
        
        processingSteps.forEach((step, index) => {
            step.addEventListener('click', () => {
                processingSteps.forEach(s => s.classList.remove('active'));
                stageInfos.forEach(info => info.classList.remove('active'));
                
                step.classList.add('active');
                stageInfos[index].classList.add('active');
                this.updateProcessingModel(index + 1);
            });
        });

        // Model control buttons
        const controlBtns = document.querySelectorAll('.control-btn');
        controlBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleModelControl(action, btn.closest('.section').id);
            });
        });
    }

    initialize3DScenes() {
        // Initialize Three.js scenes for each section
        this.createHeroScene();
        this.createFormationScene();
        this.createExplorationScene();
        this.createExtractionScene();
        this.createProcessingScene();
        this.createReclamationScene();
    }

    createHeroScene() {
        const container = document.getElementById('hero-3d');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0xFF9800, 0);
        container.appendChild(renderer.domElement);

        // Create uranium atom representation
        const atomGeometry = new THREE.SphereGeometry(2, 32, 32);
        const atomMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8bc34a,
            transparent: true,
            opacity: 0.8
        });
        const atom = new THREE.Mesh(atomGeometry, atomMaterial);
        scene.add(atom);

        // Create electron orbits
        for (let i = 0; i < 3; i++) {
            const orbitGeometry = new THREE.RingGeometry(3 + i * 1.5, 3.1 + i * 1.5, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFF7043,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            scene.add(orbit);
        }

        // Add electrons
        for (let i = 0; i < 6; i++) {
            const electronGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const electronMaterial = new THREE.MeshPhongMaterial({ color: 0xFFF3E0 });
            const electron = new THREE.Mesh(electronGeometry, electronMaterial);
            
            const angle = (i / 6) * Math.PI * 2;
            const radius = 3 + (i % 2) * 1.5;
            electron.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
            scene.add(electron);
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        scene.add(directionalLight);

        camera.position.z = 10;

        // Animation
        const animate = () => {
            requestAnimationFrame(animate);
            
            atom.rotation.y += 0.005;
            scene.children.forEach((child, index) => {
                if (index > 0 && child.type === 'Mesh') {
                    child.rotation.y += 0.01;
                }
            });
            
            renderer.render(scene, camera);
        };
        animate();

        this.scenes.hero = { scene, camera, renderer, animate };
    }

    createFormationScene() {
        const container = document.getElementById('formation-3d');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0xFFA726);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Create realistic geological layers with varied thickness and composition
        const layers = [];
        const layerData = [
            { color: 0xFFB74D, thickness: 0.8, name: 'Sandstone' },
            { color: 0xFF7043, thickness: 1.2, name: 'Shale' },
            { color: 0xFFD180, thickness: 0.6, name: 'Limestone' },
            { color: 0xFF5722, thickness: 1.0, name: 'Granite' },
            { color: 0xFF9800, thickness: 0.4, name: 'Uranium-bearing layer' }
        ];
        
        for (let i = 0; i < layerData.length; i++) {
            const data = layerData[i];
            const geometry = new THREE.BoxGeometry(10, data.thickness, 10);
            const material = new THREE.MeshPhongMaterial({ 
                color: data.color,
                roughness: 0.8,
                metalness: 0.1
            });
            const layer = new THREE.Mesh(geometry, material);
            layer.position.y = -i * 1.2;
            layer.castShadow = true;
            layer.receiveShadow = true;
            scene.add(layer);
            layers.push(layer);
        }

        // Create realistic uranium deposits with varied shapes and sizes
        const depositShapes = [
            new THREE.SphereGeometry(0.4, 32, 32),
            new THREE.DodecahedronGeometry(0.3),
            new THREE.OctahedronGeometry(0.35),
            new THREE.TetrahedronGeometry(0.25)
        ];
        
        const depositMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8bc34a,
            emissive: 0x4a7c59,
            emissiveIntensity: 0.3,
            metalness: 0.7,
            roughness: 0.2
        });
        
        for (let i = 0; i < 12; i++) {
            const shapeIndex = Math.floor(Math.random() * depositShapes.length);
            const deposit = new THREE.Mesh(depositShapes[shapeIndex], depositMaterial);
            deposit.position.set(
                (Math.random() - 0.5) * 8,
                -Math.random() * 4 - 1,
                (Math.random() - 0.5) * 8
            );
            deposit.castShadow = true;
            deposit.receiveShadow = true;
            scene.add(deposit);
        }

        // Add geological faults and fractures
        for (let i = 0; i < 6; i++) {
            const faultGeometry = new THREE.BoxGeometry(0.1, 4, 0.1);
            const faultMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xFFB74D,
                transparent: true,
                opacity: 0.6
            });
            const fault = new THREE.Mesh(faultGeometry, faultMaterial);
            fault.position.set(
                (Math.random() - 0.5) * 6,
                -2,
                (Math.random() - 0.5) * 6
            );
            fault.rotation.z = Math.random() * Math.PI;
            scene.add(fault);
        }

        // Enhanced lighting for realistic appearance
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x8bc34a, 0.5, 10);
        pointLight.position.set(0, -2, 0);
        scene.add(pointLight);

        camera.position.set(8, 8, 8);
        camera.lookAt(0, 0, 0);

        // Animation with realistic movement
        const animate = () => {
            requestAnimationFrame(animate);
            
            layers.forEach((layer, index) => {
                layer.rotation.y += 0.001 * (index + 1);
            });
            
            renderer.render(scene, camera);
        };
        animate();

        this.scenes.formation = { scene, camera, renderer, animate };
    }

    createExplorationScene() {
        const container = document.getElementById('exploration-3d');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x87CEEB);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Create realistic terrain with elevation variations
        const terrainGeometry = new THREE.PlaneGeometry(30, 30, 50, 50);
        const vertices = terrainGeometry.attributes.position.array;
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            vertices[i + 1] = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2 + 
                              Math.random() * 0.5;
        }
        
        terrainGeometry.computeVertexNormals();
        const terrainMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8FBC8F,
            roughness: 0.8
        });
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        scene.add(terrain);

        // Create realistic drilling rig
        const rigGroup = new THREE.Group();
        
        // Main rig structure
        const rigBaseGeometry = new THREE.BoxGeometry(3, 0.5, 3);
        const rigBaseMaterial = new THREE.MeshPhongMaterial({ color: 0xFF7043 });
        const rigBase = new THREE.Mesh(rigBaseGeometry, rigBaseMaterial);
        rigBase.position.y = 0.25;
        rigBase.castShadow = true;
        rigGroup.add(rigBase);

        // Rig mast
        const mastGeometry = new THREE.BoxGeometry(0.3, 6, 0.3);
        const mastMaterial = new THREE.MeshPhongMaterial({ color: 0xFF9800 });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.y = 3.25;
        mast.castShadow = true;
        rigGroup.add(mast);

        // Drill bit
        const drillGeometry = new THREE.CylinderGeometry(0.1, 0.2, 2, 8);
        const drillMaterial = new THREE.MeshPhongMaterial({ color: 0xE65100 });
        const drill = new THREE.Mesh(drillGeometry, drillMaterial);
        drill.position.y = -1;
        drill.castShadow = true;
        rigGroup.add(drill);

        // Drill pipe
        const pipeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 8);
        const pipeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD180 });
        const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
        pipe.position.y = 1;
        pipe.castShadow = true;
        rigGroup.add(pipe);

        // Winch system
        const winchGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
        const winchMaterial = new THREE.MeshPhongMaterial({ color: 0xFFB74D });
        const winch = new THREE.Mesh(winchGeometry, winchMaterial);
        winch.position.set(1.5, 5, 0);
        winch.rotation.z = Math.PI / 2;
        winch.castShadow = true;
        rigGroup.add(winch);

        rigGroup.position.set(0, 0, 0);
        scene.add(rigGroup);

        // Add multiple scanning waves with different frequencies
        const waves = [];
        for (let i = 0; i < 3; i++) {
            const waveGeometry = new THREE.RingGeometry(3 + i * 2, 3.1 + i * 2, 32);
            const waveMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x8bc34a,
                transparent: true,
                opacity: 0.3
            });
            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.rotation.x = -Math.PI / 2;
            wave.position.y = 0.1;
            wave.scale.setScalar(1 + i * 0.5);
            scene.add(wave);
            waves.push(wave);
        }

        // Add geophysical equipment
        const equipmentGroup = new THREE.Group();
        
        // Seismic equipment
        const seismicGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
        const seismicMaterial = new THREE.MeshPhongMaterial({ color: 0xFF5722 });
        const seismic = new THREE.Mesh(seismicGeometry, seismicMaterial);
        seismic.position.set(-3, 0.15, -3);
        seismic.castShadow = true;
        equipmentGroup.add(seismic);

        // Magnetometer
        const magnetometerGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
        const magnetometerMaterial = new THREE.MeshPhongMaterial({ color: 0xFFA726 });
        const magnetometer = new THREE.Mesh(magnetometerGeometry, magnetometerMaterial);
        magnetometer.position.set(3, 0.4, -3);
        magnetometer.castShadow = true;
        equipmentGroup.add(magnetometer);

        scene.add(equipmentGroup);

        // Enhanced lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x8bc34a, 0.3, 15);
        pointLight.position.set(0, 5, 0);
        scene.add(pointLight);

        camera.position.set(0, 15, 15);
        camera.lookAt(0, 0, 0);

        // Animation with realistic equipment movement
        let waveScales = [1, 1.2, 1.4];
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Rotate drill
            drill.rotation.z += 0.1;
            
            // Animate waves
            waves.forEach((wave, index) => {
                waveScales[index] += 0.015;
                wave.scale.setScalar(waveScales[index]);
                wave.material.opacity = Math.max(0, 0.3 - waveScales[index] / 20);
                
                if (waveScales[index] > 8) {
                    waveScales[index] = 1 + index * 0.5;
                    wave.material.opacity = 0.3;
                }
            });
            
            // Rotate winch
            winch.rotation.x += 0.02;
            
            renderer.render(scene, camera);
        };
        animate();

        this.scenes.exploration = { scene, camera, renderer, animate };
    }

    createExtractionScene() {
        const container = document.getElementById('extraction-3d');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0xFF9800);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Create realistic open-pit mine
        const mineGroup = new THREE.Group();
        
        // Pit walls with realistic geometry
        const pitGeometry = new THREE.CylinderGeometry(4, 6, 8, 32, 4, true);
        const pitMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B4513,
            roughness: 0.9
        });
        const pit = new THREE.Mesh(pitGeometry, pitMaterial);
        pit.position.y = -2;
        pit.castShadow = true;
        pit.receiveShadow = true;
        mineGroup.add(pit);

        // Mining equipment - Excavator
        const excavatorGroup = new THREE.Group();
        
        // Excavator base
        const baseGeometry = new THREE.BoxGeometry(2, 1, 3);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xFF5722 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        excavatorGroup.add(base);

        // Excavator arm
        const armGeometry = new THREE.BoxGeometry(0.3, 3, 0.3);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0xFFA726 });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.set(0, 2, 0);
        arm.castShadow = true;
        excavatorGroup.add(arm);

        // Bucket
        const bucketGeometry = new THREE.BoxGeometry(1, 0.8, 1.2);
        const bucketMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD180 });
        const bucket = new THREE.Mesh(bucketGeometry, bucketMaterial);
        bucket.position.set(0, 3.5, 0);
        bucket.castShadow = true;
        excavatorGroup.add(bucket);

        excavatorGroup.position.set(2, 0, 0);
        mineGroup.add(excavatorGroup);

        // Haul truck
        const truckGroup = new THREE.Group();
        
        // Truck body
        const truckBodyGeometry = new THREE.BoxGeometry(1.5, 1, 2.5);
        const truckBodyMaterial = new THREE.MeshPhongMaterial({ color: 0xFF9800 });
        const truckBody = new THREE.Mesh(truckBodyGeometry, truckBodyMaterial);
        truckBody.position.y = 0.5;
        truckBody.castShadow = true;
        truckGroup.add(truckBody);

        // Truck cabin
        const cabinGeometry = new THREE.BoxGeometry(1, 0.8, 0.8);
        const cabinMaterial = new THREE.MeshPhongMaterial({ color: 0xFF7043 });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, 1.4, -0.8);
        cabin.castShadow = true;
        truckGroup.add(cabin);

        // Wheels
        for (let i = 0; i < 4; i++) {
            const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
            const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0xE65100 });
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(
                (i < 2 ? -0.6 : 0.6),
                0.3,
                (i % 2 === 0 ? -1 : 1)
            );
            wheel.castShadow = true;
            truckGroup.add(wheel);
        }

        truckGroup.position.set(-3, 0, 0);
        mineGroup.add(truckGroup);

        // Ore conveyor system
        const conveyorGroup = new THREE.Group();
        
        // Conveyor belt
        const beltGeometry = new THREE.BoxGeometry(6, 0.1, 0.8);
        const beltMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD180 });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.05;
        belt.castShadow = true;
        conveyorGroup.add(belt);

        // Conveyor supports
        for (let i = 0; i < 3; i++) {
            const supportGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
            const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
            const support = new THREE.Mesh(supportGeometry, supportMaterial);
            support.position.set((i - 1) * 2, -0.45, 0);
            support.castShadow = true;
            conveyorGroup.add(support);
        }

        conveyorGroup.position.set(0, 0, 2);
        mineGroup.add(conveyorGroup);

        // Realistic ore chunks with varied shapes
        const oreShapes = [
            new THREE.DodecahedronGeometry(0.2),
            new THREE.OctahedronGeometry(0.25),
            new THREE.TetrahedronGeometry(0.15),
            new THREE.SphereGeometry(0.2, 8, 8)
        ];
        
        for (let i = 0; i < 15; i++) {
            const shapeIndex = Math.floor(Math.random() * oreShapes.length);
            const oreGeometry = oreShapes[shapeIndex];
            const oreMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x8bc34a,
                emissive: 0x4a7c59,
                emissiveIntensity: 0.2,
                metalness: 0.6,
                roughness: 0.3
            });
            const ore = new THREE.Mesh(oreGeometry, oreMaterial);
            ore.position.set(
                (Math.random() - 0.5) * 8,
                Math.random() * 3 - 1,
                (Math.random() - 0.5) * 8
            );
            ore.castShadow = true;
            ore.receiveShadow = true;
            scene.add(ore);
        }

        scene.add(mineGroup);

        // Enhanced lighting for realistic mining environment
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffa500, 0.5, 15);
        pointLight.position.set(0, 5, 0);
        scene.add(pointLight);

        camera.position.set(8, 8, 8);
        camera.lookAt(0, 0, 0);

        // Animation with realistic mining operations
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Rotate excavator arm
            arm.rotation.z = Math.sin(Date.now() * 0.001) * 0.3;
            
            // Move truck
            truckGroup.position.x = Math.sin(Date.now() * 0.002) * 2;
            
            // Rotate wheels
            truckGroup.children.forEach((child, index) => {
                if (index > 1) { // Wheels
                    child.rotation.x += 0.1;
                }
            });
            
            // Animate conveyor belt
            belt.position.x = Math.sin(Date.now() * 0.005) * 0.1;
            
            renderer.render(scene, camera);
        };
        animate();

        this.scenes.extraction = { scene, camera, renderer, animate };
    }

    createProcessingScene() {
        const container = document.getElementById('processing-3d');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0xFF7043);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Create realistic processing facility
        const facilityGroup = new THREE.Group();
        
        // Main processing tanks with realistic details
        const tankData = [
            { position: [-4, 0, 0], color: 0xFF7043, name: 'Leaching Tank' },
            { position: [0, 0, 0], color: 0xFFA726, name: 'Extraction Tank' },
            { position: [4, 0, 0], color: 0xFF9800, name: 'Purification Tank' }
        ];
        
        const tanks = [];
        tankData.forEach((data, index) => {
            const tankGroup = new THREE.Group();
            
            // Tank body
            const tankGeometry = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32);
            const tankMaterial = new THREE.MeshPhongMaterial({ 
                color: data.color,
                metalness: 0.3,
                roughness: 0.7
            });
            const tank = new THREE.Mesh(tankGeometry, tankMaterial);
            tank.position.y = 1.25;
            tank.castShadow = true;
            tank.receiveShadow = true;
            tankGroup.add(tank);
            
            // Tank lid
            const lidGeometry = new THREE.CylinderGeometry(1.25, 1.25, 0.1, 32);
            const lidMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
            const lid = new THREE.Mesh(lidGeometry, lidMaterial);
            lid.position.y = 2.8;
            lid.castShadow = true;
            tankGroup.add(lid);
            
            // Tank inlet/outlet pipes
            const inletGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
            const inletMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
            const inlet = new THREE.Mesh(inletGeometry, inletMaterial);
            inlet.position.set(0, 2.5, 1.2);
            inlet.castShadow = true;
            tankGroup.add(inlet);
            
            const outletGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
            const outletMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
            const outlet = new THREE.Mesh(outletGeometry, outletMaterial);
            outlet.position.set(0, 0.5, -1.2);
            outlet.castShadow = true;
            tankGroup.add(outlet);
            
            // Liquid in tank
            const liquidGeometry = new THREE.CylinderGeometry(1.1, 1.1, 2.3, 32);
            const liquidMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x8bc34a,
                transparent: true,
                opacity: 0.6,
                metalness: 0.1,
                roughness: 0.2
            });
            const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
            liquid.position.y = 1.15;
            liquid.userData = { type: 'liquid', tankIndex: index };
            tankGroup.add(liquid);
            
            tankGroup.position.set(data.position[0], data.position[1], data.position[2]);
            facilityGroup.add(tankGroup);
            tanks.push(tankGroup);
        });

        // Interconnecting pipe system
        const pipeSystem = new THREE.Group();
        
        // Main pipes connecting tanks
        for (let i = 0; i < 2; i++) {
            const pipeGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2, 8);
            const pipeMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xFFB74D,
                metalness: 0.8,
                roughness: 0.2
            });
            const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
            pipe.position.set(i * 2 - 1, 1.5, 0);
            pipe.rotation.z = Math.PI / 2;
            pipe.castShadow = true;
            pipeSystem.add(pipe);
        }
        
        // Vertical pipes
        for (let i = 0; i < 3; i++) {
            const vPipeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
            const vPipeMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
            const vPipe = new THREE.Mesh(vPipeGeometry, vPipeMaterial);
            vPipe.position.set((i - 1) * 4, 0.5, 0);
            vPipe.castShadow = true;
            pipeSystem.add(vPipe);
        }
        
        facilityGroup.add(pipeSystem);

        // Control panel
        const panelGeometry = new THREE.BoxGeometry(3, 0.1, 1);
        const panelMaterial = new THREE.MeshPhongMaterial({ color: 0xFF7043 });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(0, 3.5, 2);
        panel.castShadow = true;
        facilityGroup.add(panel);
        
        // Control buttons
        for (let i = 0; i < 6; i++) {
            const buttonGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8);
            const buttonMaterial = new THREE.MeshPhongMaterial({ 
                color: i % 2 === 0 ? 0xFF5722 : 0xFFA726
            });
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set((i - 2.5) * 0.4, 3.56, 2.4);
            button.castShadow = true;
            facilityGroup.add(button);
        }

        // Conveyor belt for ore input
        const conveyorGeometry = new THREE.BoxGeometry(8, 0.1, 0.8);
        const conveyorMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD180 });
        const conveyor = new THREE.Mesh(conveyorGeometry, conveyorMaterial);
        conveyor.position.set(0, 0.05, -3);
        conveyor.castShadow = true;
        facilityGroup.add(conveyor);
        
        // Conveyor supports
        for (let i = 0; i < 4; i++) {
            const supportGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);
            const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
            const support = new THREE.Mesh(supportGeometry, supportMaterial);
            support.position.set((i - 1.5) * 2, -0.2, -3);
            support.castShadow = true;
            facilityGroup.add(support);
        }

        scene.add(facilityGroup);

        // Enhanced lighting for industrial environment
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        const pointLight1 = new THREE.PointLight(0x8bc34a, 0.4, 10);
        pointLight1.position.set(-4, 2, 0);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x3498db, 0.4, 10);
        pointLight2.position.set(4, 2, 0);
        scene.add(pointLight2);

        camera.position.set(0, 8, 12);
        camera.lookAt(0, 0, 0);

        // Animation with realistic processing operations
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Animate liquid levels
            tanks.forEach((tank, index) => {
                const liquid = tank.children.find(child => child.userData.type === 'liquid');
                if (liquid) {
                    liquid.rotation.y += 0.01;
                    liquid.position.y = 1.15 + Math.sin(Date.now() * 0.001 + index) * 0.1;
                }
            });
            
            // Animate conveyor belt
            conveyor.position.x = Math.sin(Date.now() * 0.003) * 0.1;
            
            // Animate control panel lights
            facilityGroup.children.forEach((child, index) => {
                if (child.material && child.material.color && 
                    (child.material.color.getHex() === 0xe74c3c || child.material.color.getHex() === 0x27ae60)) {
                    child.material.emissiveIntensity = Math.sin(Date.now() * 0.005 + index) * 0.3 + 0.1;
                }
            });
            
            renderer.render(scene, camera);
        };
        animate();

        this.scenes.processing = { scene, camera, renderer, animate };
    }

    createReclamationScene() {
        const container = document.getElementById('reclamation-3d');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x87CEEB);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Create realistic restored landscape
        const landscapeGroup = new THREE.Group();
        
        // Terrain with natural contours
        const terrainGeometry = new THREE.PlaneGeometry(30, 30, 50, 50);
        const vertices = terrainGeometry.attributes.position.array;
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            vertices[i + 1] = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 1.5 + 
                              Math.random() * 0.3;
        }
        
        terrainGeometry.computeVertexNormals();
        const terrainMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8FBC8F,
            roughness: 0.9
        });
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        landscapeGroup.add(terrain);

        // Realistic vegetation system
        const vegetationGroup = new THREE.Group();
        
        // Different tree types
        const treeTypes = [
            { trunkColor: 0x8B4513, leavesColor: 0x228B22, height: 2, spread: 1.2 },
            { trunkColor: 0xA0522D, leavesColor: 0x32CD32, height: 1.5, spread: 0.8 },
            { trunkColor: 0x654321, leavesColor: 0x006400, height: 3, spread: 1.5 }
        ];
        
        for (let i = 0; i < 25; i++) {
            const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
            
            // Tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.08, 0.12, treeType.height, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({ 
                color: treeType.trunkColor,
                roughness: 0.8
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = treeType.height / 2;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            
            // Tree leaves (multiple layers for realism)
            const leavesGroup = new THREE.Group();
            for (let j = 0; j < 3; j++) {
                const leavesGeometry = new THREE.SphereGeometry(treeType.spread - j * 0.2, 8, 8);
                const leavesMaterial = new THREE.MeshPhongMaterial({ 
                    color: treeType.leavesColor,
                    transparent: true,
                    opacity: 0.8 - j * 0.2
                });
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.y = treeType.height + j * 0.3;
                leaves.castShadow = true;
                leaves.receiveShadow = true;
                leavesGroup.add(leaves);
            }
            
            const treeGroup = new THREE.Group();
            treeGroup.add(trunk);
            treeGroup.add(leavesGroup);
            
            treeGroup.position.set(
                (Math.random() - 0.5) * 25,
                0,
                (Math.random() - 0.5) * 25
            );
            treeGroup.rotation.y = Math.random() * Math.PI * 2;
            
            vegetationGroup.add(treeGroup);
        }

        // Grass and ground cover
        for (let i = 0; i < 100; i++) {
            const grassGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4);
            const grassMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xFFD180,
                transparent: true,
                opacity: 0.7
            });
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            grass.position.set(
                (Math.random() - 0.5) * 25,
                0.15,
                (Math.random() - 0.5) * 25
            );
            grass.rotation.x = Math.random() * 0.2;
            grass.rotation.z = Math.random() * Math.PI * 2;
            grass.castShadow = true;
            vegetationGroup.add(grass);
        }

        landscapeGroup.add(vegetationGroup);

        // Water features
        const waterGroup = new THREE.Group();
        
        // Main water body
        const waterGeometry = new THREE.PlaneGeometry(12, 8);
        const waterMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4169E1,
            transparent: true,
            opacity: 0.7,
            metalness: 0.1,
            roughness: 0.2
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.05;
        water.castShadow = true;
        water.receiveShadow = true;
        waterGroup.add(water);
        
        // Water ripples
        for (let i = 0; i < 5; i++) {
            const rippleGeometry = new THREE.RingGeometry(0.5 + i * 0.3, 0.6 + i * 0.3, 16);
            const rippleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFF3E0,
                transparent: true,
                opacity: 0.3
            });
            const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
            ripple.rotation.x = -Math.PI / 2;
            ripple.position.y = 0.06;
            ripple.userData = { index: i };
            waterGroup.add(ripple);
        }
        
        waterGroup.position.set(0, 0, 5);
        landscapeGroup.add(waterGroup);

        // Wildlife (birds)
        for (let i = 0; i < 8; i++) {
            const birdGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            const birdMaterial = new THREE.MeshPhongMaterial({ color: 0xFF7043 });
            const bird = new THREE.Mesh(birdGeometry, birdMaterial);
            bird.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 3 + 2,
                (Math.random() - 0.5) * 20
            );
            bird.userData = { 
                originalY: bird.position.y,
                speed: Math.random() * 0.02 + 0.01
            };
            bird.castShadow = true;
            landscapeGroup.add(bird);
        }

        scene.add(landscapeGroup);

        // Enhanced lighting for natural environment
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x87CEEB, 0.3, 20);
        pointLight.position.set(0, 5, 0);
        scene.add(pointLight);

        camera.position.set(0, 15, 15);
        camera.lookAt(0, 0, 0);

        // Animation with natural movement
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Animate trees gently swaying
            vegetationGroup.children.forEach((tree, index) => {
                if (tree.children && tree.children.length > 0) {
                    tree.rotation.y += 0.001;
                    tree.children.forEach((child, childIndex) => {
                        if (childIndex > 0) { // Leaves
                            child.rotation.y = Math.sin(Date.now() * 0.001 + index) * 0.1;
                        }
                    });
                }
            });
            
            // Animate water ripples
            waterGroup.children.forEach((child, index) => {
                if (child.userData.index !== undefined) {
                    child.scale.setScalar(1 + Math.sin(Date.now() * 0.002 + child.userData.index) * 0.1);
                    child.material.opacity = 0.3 + Math.sin(Date.now() * 0.003 + child.userData.index) * 0.1;
                }
            });
            
            // Animate birds flying
            landscapeGroup.children.forEach((child, index) => {
                if (child.userData.originalY !== undefined) {
                    child.position.y = child.userData.originalY + Math.sin(Date.now() * child.userData.speed) * 0.5;
                    child.position.x += 0.01;
                    if (child.position.x > 15) {
                        child.position.x = -15;
                    }
                }
            });
            
            renderer.render(scene, camera);
        };
        animate();

        this.scenes.reclamation = { scene, camera, renderer, animate };
    }

    updateExtractionModel(method) {
        const scene = this.scenes.extraction;
        if (!scene) return;

        // Update scene based on mining method
        switch(method) {
            case 'open-pit':
                // Show open pit representation
                break;
            case 'underground':
                // Show underground mining
                break;
            case 'in-situ':
                // Show in-situ leaching
                break;
        }
    }

    updateProcessingModel(stage) {
        const scene = this.scenes.processing;
        if (!scene) return;

        // Update processing visualization based on stage
        console.log(`Updating processing model to stage ${stage}`);
    }

    handleModelControl(action, sectionId) {
        const scene = this.scenes[sectionId];
        if (!scene) return;

        switch(action) {
            case 'rotate':
                // Add rotation animation
                break;
            case 'zoom':
                // Add zoom animation
                break;
            case 'reset':
                // Reset camera position
                scene.camera.position.set(5, 5, 5);
                scene.camera.lookAt(0, 0, 0);
                break;
        }
    }

    setupGSAPAnimations() {
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);

        // Animate section titles and content
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.fromTo(title, 
                { opacity: 0, y: 50 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: title,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        gsap.utils.toArray('.section-subtitle').forEach(subtitle => {
            gsap.fromTo(subtitle, 
                { opacity: 0, y: 30 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.8,
                    delay: 0.2,
                    scrollTrigger: {
                        trigger: subtitle,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Animate content cards
        gsap.utils.toArray('.content-card').forEach((card, index) => {
            gsap.fromTo(card, 
                { opacity: 0, y: 30 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.6,
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        end: "bottom 15%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Animate 3D containers
        gsap.utils.toArray('.model-container').forEach(container => {
            gsap.fromTo(container, 
                { opacity: 0, scale: 0.8 },
                { 
                    opacity: 1, 
                    scale: 1, 
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: container,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
function handleResize() {
    Object.values(window.uraniumExperience.scenes).forEach(scene => {
        if (scene && scene.renderer) {
            const container = scene.renderer.domElement.parentElement;
            if (container) {
                const width = container.clientWidth;
                const height = container.clientHeight;
                
                scene.camera.aspect = width / height;
                scene.camera.updateProjectionMatrix();
                scene.renderer.setSize(width, height);
            }
        }
    });
}

// Initialize the experience when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uraniumExperience = new UraniumMiningExperience();
    
    // Handle window resize
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Add smooth scrolling for all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            window.uraniumExperience.scrollToSection(targetId);
        });
    });
});

// Global function for CTA button
function scrollToSection(sectionId) {
    if (window.uraniumExperience) {
        window.uraniumExperience.scrollToSection(sectionId);
    }
} 