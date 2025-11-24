class Clouds {
    constructor(scene, count = 15) {
        this.scene = scene;
        this.count = count;
        this.clouds = [];
        this.init();
    }

    init() {
        // Create a simple low-poly cloud shape using multiple cubes
        const cloudGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            flatShading: true,
            transparent: true,
            opacity: 0.8,
            roughness: 1,
            metalness: 0
        });

        for (let i = 0; i < this.count; i++) {
            const cloudGroup = new THREE.Group();
            
            // Randomize cloud size and complexity
            const blobs = Math.floor(Math.random() * 5) + 3;
            
            for (let j = 0; j < blobs; j++) {
                const blob = new THREE.Mesh(cloudGeometry, cloudMaterial);
                
                // Random position within the cloud cluster
                blob.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 8
                );
                
                // Random scale for each blob
                const scale = Math.random() * 5 + 2;
                blob.scale.set(scale, scale * 0.6, scale);
                
                // Random rotation
                blob.rotation.y = Math.random() * Math.PI;
                blob.rotation.z = Math.random() * Math.PI * 0.1;

                cloudGroup.add(blob);
            }

            // Position the entire cloud in the sky
            cloudGroup.position.set(
                (Math.random() - 0.5) * 400,
                Math.random() * 50 + 60, // Height between 60 and 110
                (Math.random() - 0.5) * 400
            );

            // Random rotation for the whole cloud
            cloudGroup.rotation.y = Math.random() * Math.PI * 2;

            this.scene.add(cloudGroup);
            this.clouds.push({
                mesh: cloudGroup,
                speed: (Math.random() * 0.05) + 0.01
            });
        }
    }

    update(delta) {
        this.clouds.forEach(cloud => {
            cloud.mesh.position.x += cloud.speed;
            
            // Reset position if it goes too far
            if (cloud.mesh.position.x > 200) {
                cloud.mesh.position.x = -200;
            }
        });
    }
}
