class Birds {
    constructor(scene, count = 20) {
        this.scene = scene;
        this.birds = [];
        this.count = count;
        this.centerPoint = new THREE.Vector3(0, 40, 0);
        this.flockRadius = 50;
        this.init();
    }

    init() {
        const birdGeometry = new THREE.ConeGeometry(0.5, 2, 8); // Increased size
        birdGeometry.computeVertexNormals();
        const birdMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000, // Black for contrast
            side: THREE.DoubleSide,
            fog: false
        });

        for (let i = 0; i < this.count; i++) {
            const bird = new THREE.Mesh(birdGeometry, birdMaterial);
            bird.position.set(
                Math.random() * this.flockRadius * 2 - this.flockRadius,
                this.centerPoint.y + Math.random() * 20 - 10,
                Math.random() * this.flockRadius * 2 - this.flockRadius
            );
            bird.rotation.x = Math.PI / 2;
            bird.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.2
            );
            bird.angularVelocity = (Math.random() - 0.5) * 0.02;
            this.birds.push(bird);
            this.scene.add(bird);
        }
    }

    update(delta) {
        for (const bird of this.birds) {
            // Actualizar posición
            bird.position.add(bird.velocity);

            // Calcular vector desde el centro de la bandada hacia el pájaro
            const toCenter = new THREE.Vector3().subVectors(this.centerPoint, bird.position);
            const distanceToCenter = toCenter.length();

            // Si el pájaro está fuera del radio de la bandada, ajustar su velocidad
            if (distanceToCenter > this.flockRadius) {
                toCenter.normalize().multiplyScalar(0.01);
                bird.velocity.add(toCenter);
            }

            // Añadir un movimiento circular
            const perpendicular = new THREE.Vector3(-bird.position.z, 0, bird.position.x).normalize();
            bird.position.add(perpendicular.multiplyScalar(bird.angularVelocity));

            // Limitar la altura
            if (bird.position.y < this.centerPoint.y - 10) bird.velocity.y += 0.01;
            if (bird.position.y > this.centerPoint.y + 10) bird.velocity.y -= 0.01;

            // Limitar la velocidad
            bird.velocity.clampLength(0, 0.5);

            // Orientar el pájaro en la dirección del movimiento
            bird.lookAt(bird.position.clone().add(bird.velocity));
            bird.rotateX(Math.PI / 2);
        }
    }
}