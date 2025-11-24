// src/script.js

const Game = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    player: null,
    birds: null,
    clouds: null,
    vegetation: null,
    isPlaying: false,
    isPaused: false,
    animationFrameId: null,
    clock: new THREE.Clock(),
    shaderMaterial: null,
    sun: null,
    sunLight: null,

    init() {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.createSkyAndSun();
        this.initLights();
        this.createGround();
        this.createTrees();
        this.initControls();
        this.initPlayer();
        this.initBirds();
        this.initClouds();
        this.initVegetation();
        this.applyShader();
        this.initMenuListeners();
        window.addEventListener('resize', () => this.onWindowResize(), false);
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    },

    initScene() {
        this.scene = new THREE.Scene();
    },

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);  // Aumenta el far plane
        this.camera.position.set(0, 1.6, 5);
    },

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true; // Enable shadows
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    },

    createSkyAndSun() {
        // Crear el cielo
        const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
        const textureLoader = new THREE.TextureLoader();
        const skyTexture = textureLoader.load(
            'assets/skybox/OIP.jpg',
            (texture) => {
                console.log('Textura del cielo cargada correctamente');
                this.renderer.render(this.scene, this.camera);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% cargado');
            },
            (err) => {
                console.error('Error al cargar la textura del cielo', err);
            }
        );
        const skyMaterial = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide,
            fog: false  // Asegúrate de que el cielo no tenga niebla
        });
        this.sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.sky);

        // Crear el sol
        const sunGeometry = new THREE.CircleGeometry(10, 32);
        const sunMaterial = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(SunShader.uniforms),
            vertexShader: SunShader.vertexShader,
            fragmentShader: SunShader.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(100, 100, -100);
        this.sun.lookAt(this.scene.position);
        this.scene.add(this.sun);

        // Luz direccional para simular la luz del sol
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        this.sunLight.position.copy(this.sun.position);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        this.scene.add(this.sunLight);
    },

    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
    },

    createGround() {
        const groundGroup = new THREE.Group();
        const tileSize = 2;
        const mapSize = 100;
        const tilesPerSide = mapSize / tileSize;
        const overlap = 0.1;

        const loader = new THREE.TextureLoader();
        const textures = [
            loader.load('assets/textures/ground/grass_1.png'),
            loader.load('assets/textures/ground/grass_2.png'),
            loader.load('assets/textures/ground/grass_3.png'),
            loader.load('assets/textures/ground/grass_2.png')
        ];

        textures.forEach(texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1.1, 1.1);
        });

        const baseGeometry = new THREE.PlaneGeometry(mapSize + tileSize * 2, mapSize + tileSize * 2);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x1a5f1a, roughness: 1, metalness: 0 });
        const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
        basePlane.rotation.x = -Math.PI / 2;
        basePlane.position.y = -0.05;
        basePlane.receiveShadow = true;
        groundGroup.add(basePlane);

        for (let i = 0; i < tilesPerSide; i++) {
            for (let j = 0; j < tilesPerSide; j++) {
                const tileGeometry = new THREE.PlaneGeometry(tileSize + overlap * 2, tileSize + overlap * 2);
                const randomTextureIndex = Math.floor(Math.random() * textures.length);
                const tileMaterial = new THREE.MeshStandardMaterial({
                    map: textures[randomTextureIndex],
                    roughness: 1,
                    metalness: 0,
                    transparent: true,
                    opacity: 0.99
                });

                const tile = new THREE.Mesh(tileGeometry, tileMaterial);
                tile.rotation.x = -Math.PI / 2;
                tile.position.set(
                    (i - tilesPerSide / 2) * tileSize + tileSize / 2,
                    0,
                    (j - tilesPerSide / 2) * tileSize + tileSize / 2
                );

                tile.position.y += Math.random() * 0.02;
                tile.rotation.z = (Math.random() - 0.5) * 0.02;
                tile.receiveShadow = true;

                groundGroup.add(tile);
            }
        }

        groundGroup.children.sort((a, b) => b.position.z - a.position.z);
        this.scene.add(groundGroup);
    },

    createTrees() {
        const treeGeometry = new THREE.ConeGeometry(1, 4, 6);
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 6);

        const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57, flatShading: true });
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, flatShading: true });

        for (let i = 0; i < 100; i++) {
            const treeGroup = new THREE.Group();

            // Leaves
            const leaves = new THREE.Mesh(treeGeometry, treeMaterial);
            leaves.position.y = 2.5;
            leaves.castShadow = true;
            leaves.receiveShadow = true;
            treeGroup.add(leaves);

            // Trunk
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 0.5;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            treeGroup.add(trunk);

            treeGroup.position.set(
                Math.random() * 150 - 75,
                0,
                Math.random() * 150 - 75
            );

            // Random scale
            const scale = Math.random() * 0.5 + 0.8;
            treeGroup.scale.set(scale, scale, scale);

            this.scene.add(treeGroup);
        }
    },

    initClouds() {
        this.clouds = new Clouds(this.scene);
    },

    initVegetation() {
        this.vegetation = new Vegetation(this.scene);
    },

    initControls() {
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        this.scene.add(this.controls.getObject());

        this.controls.addEventListener('lock', () => {
            if (this.isPlaying && !this.isPaused) {
                document.getElementById('pause-menu').style.display = 'none';
            }
        });

        this.controls.addEventListener('unlock', () => {
            if (this.isPlaying && !this.isPaused) {
                this.togglePause();
            }
        });
    },

    initPlayer() {
        this.player = new Player(this.camera, this.scene, this.controls);
    },

    initBirds() {
        this.birds = new Birds(this.scene);
    },

    applyShader() {
        const fogColor = new THREE.Color(0xcccccc);
        const fogNear = 50;
        const fogFar = 300;

        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child !== this.sun && child !== this.sky) {
                // Skip if material is already shader material or if it's part of clouds/vegetation which might have their own materials
                // For simplicity, we apply fog to everything except sky and sun, but we need to be careful not to break custom materials

                // Only apply to basic/standard materials to add fog if they don't have it
                if (child.material.type === 'MeshBasicMaterial' || child.material.type === 'MeshStandardMaterial') {
                    // Actually, Three.js standard materials support fog by default if scene.fog is set.
                    // The custom shader logic in the original code was replacing materials with a custom shader.
                    // I will keep the original logic but make sure it respects the new objects.

                    // However, for better visuals (shadows, lighting), standard materials are better.
                    // The original code replaced everything with a custom shader.
                    // Let's try to stick to StandardMaterial where possible and only use custom shader if needed.
                    // But the user asked for "shaders", so keeping the custom shader logic is probably desired,
                    // OR I can just rely on Three.js built-in fog and standard materials which look better usually.

                    // Let's keep the custom shader application for now but ensure it handles the new properties.
                    // Actually, the custom shader logic might break the InstancedMesh (Vegetation).
                    // InstancedMesh needs special handling in custom shaders.

                    // DECISION: Skip applying custom shader to InstancedMesh (Vegetation) and Clouds (Group of meshes).
                    // Clouds use StandardMaterial, Vegetation uses InstancedMesh.

                    if (child.isInstancedMesh) return;
                }

                let uniforms = THREE.UniformsUtils.clone(Shaders.uniforms);
                if (child.material.map) {
                    uniforms.map.value = child.material.map;
                    uniforms.useTexture.value = true;
                } else {
                    uniforms.color.value = child.material.color || new THREE.Color(0xffffff);
                    uniforms.useTexture.value = false;
                }
                uniforms.fogColor.value = fogColor;
                uniforms.fogNear.value = fogNear;
                uniforms.fogFar.value = fogFar;

                // Note: Replacing material on everything might lose properties like roughness/metalness.
                // For the "ground" and "trees", we want shadows. Custom shader needs to handle shadows manually or use MeshStandardMaterial.
                // The original custom shader is very basic (MeshBasic-like with fog).
                // To make it look "better" and "more realistic", I should probably switch to MeshStandardMaterial and let Three.js handle lighting/fog.
                // But I will stick to the requested "add shaders" by keeping this but maybe improving it?
                // Actually, the user said "add shaders", implying they want visual effects.
                // But replacing everything with a basic shader removes shadows.

                // I will MODIFY this function to NOT replace materials for Trees and Ground if they are StandardMaterial, 
                // because I want them to receive shadows.
                // I will only apply it to objects that need this specific effect, or just rely on scene.fog.

                // The best approach for "better graphics" here is to use StandardMaterial + Scene Fog, 
                // and maybe a custom shader for specific effects (like the Sun).
                // So I will comment out the material replacement loop and just set the scene fog.
                // This will instantly make everything use the StandardMaterials I defined (which support light/shadows).
            }
        });

        this.scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    },

    initMenuListeners() {
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('resume-button').addEventListener('click', () => this.resumeGame());
        document.getElementById('quit-button').addEventListener('click', () => this.quitGame());
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isPlaying) {
                this.togglePause();
            }
        });
    },

    startGame() {
        document.getElementById('start-menu').style.display = 'none';
        this.isPlaying = true;
        this.isPaused = false;
        this.controls.lock();
        this.player.body.position.set(0, 0.8, 0);
        this.camera.position.set(0, 1.6, 0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.clock.start();
        this.animate();  // Asegúrate de que esta línea esté presente
    },

    resumeGame() {
        document.getElementById('pause-menu').style.display = 'none';
        this.isPaused = false;
        this.controls.lock();
        this.animate();
    },

    quitGame() {
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('start-menu').style.display = 'block';
        this.isPlaying = false;
        this.isPaused = false;
        this.controls.unlock();
        this.player.body.position.set(0, 0.8, 0);
        this.camera.position.set(0, 1.6, 0);
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    },

    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            document.getElementById('pause-menu').style.display = 'block';
            this.isPaused = true;
            this.controls.unlock();
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
    },

    animate() {
        if (!this.isPaused && this.isPlaying) {
            this.animationFrameId = requestAnimationFrame(() => this.animate());

            const delta = this.clock.getDelta();
            const elapsedTime = this.clock.getElapsedTime();

            this.player.update(delta);
            this.birds.update(delta);
            if (this.clouds) this.clouds.update(delta);

            // Actualizar el shader del sol
            if (this.sun && this.sun.material.uniforms) {
                this.sun.material.uniforms.time.value = elapsedTime;
            }

            // Actualizar la posición de la luz del sol
            if (this.sunLight && this.sun) {
                this.sunLight.position.copy(this.sun.position);
            }

            // Actualizar la posición del cielo
            if (this.sky) {
                this.sky.position.copy(this.camera.position);
            },

            // Asegurarse de que el cielo esté renderizado correctamente
            if (this.sky) {
                this.sky.material.depthWrite = false;
                this.sky.renderOrder = -1;  // Asegura que el cielo se renderice primero
            }

            this.renderer.render(this.scene, this.camera);

            // Registro para depuración
            if (elapsedTime % 5 < 0.1) {  // Registra cada 5 segundos aproximadamente
                console.log('Posición de la cámara:', this.camera.position);
                console.log('Posición del cielo:', this.sky ? this.sky.position : 'No hay cielo');
                console.log('Posición del sol:', this.sun ? this.sun.position : 'No hay sol');
            }
        }
    },

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    handleVisibilityChange() {
        if (document.hidden) {
            this.isPaused = true;
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        } else {
            if (this.isPlaying) {
                this.isPaused = false;
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.animate();
            }
        }
    }
};

// Iniciar el juego cuando se cargue la ventana
window.onload = () => Game.init();