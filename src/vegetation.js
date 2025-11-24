class Vegetation {
    constructor(scene, count = 5000) {
        this.scene = scene;
        this.count = count;
        this.init();
    }

    init() {
        // Grass Geometry
        const grassGeometry = new THREE.PlaneGeometry(0.5, 1);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x4caf50,
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.5
        });

        // Create InstancedMesh for grass
        this.grassMesh = new THREE.InstancedMesh(grassGeometry, grassMaterial, this.count);
        this.grassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        const dummy = new THREE.Object3D();

        for (let i = 0; i < this.count; i++) {
            dummy.position.set(
                (Math.random() - 0.5) * 100,
                0.5,
                (Math.random() - 0.5) * 100
            );

            dummy.rotation.y = Math.random() * Math.PI;
            dummy.scale.setScalar(0.5 + Math.random() * 0.5);

            // Tilt slightly
            dummy.rotation.x = (Math.random() - 0.5) * 0.2;
            dummy.rotation.z = (Math.random() - 0.5) * 0.2;

            dummy.updateMatrix();
            this.grassMesh.setMatrixAt(i, dummy.matrix);
        }

        this.grassMesh.receiveShadow = true;
        this.scene.add(this.grassMesh);

        // Add some flowers
        this.createFlowers();
    }

    createFlowers() {
        const flowerGeometry = new THREE.CircleGeometry(0.2, 5);
        const flowerMaterial = new THREE.MeshBasicMaterial({ color: 0xffeb3b, side: THREE.DoubleSide });
        const flowerMesh = new THREE.InstancedMesh(flowerGeometry, flowerMaterial, this.count / 10);

        const dummy = new THREE.Object3D();

        for (let i = 0; i < this.count / 10; i++) {
            dummy.position.set(
                (Math.random() - 0.5) * 100,
                0.6, // Slightly higher than ground
                (Math.random() - 0.5) * 100
            );
            dummy.rotation.x = -Math.PI / 2;
            dummy.updateMatrix();
            flowerMesh.setMatrixAt(i, dummy.matrix);
        }

        this.scene.add(flowerMesh);
    }
}
