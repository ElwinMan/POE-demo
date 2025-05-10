import * as THREE from 'three'
import Experience from '../Experience.js'

export default class FreezingPulse {
    constructor(startPosition, direction) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.speed = 0.15
        this.direction = direction
        this.lifeSpan = 3000 // 3 seconds lifespan
        this.startTime = this.experience.time.current

        this.damage = 30 // Damage dealt on impact
        this.freezeDuration = 1000 // Duration of freezing effect (in ms)

        // Create the Freezing Pulse Geometry and Material
        this.setGeometry()
        this.setMaterial()
        this.setMesh(startPosition)

        // Particle trail for effect (optional)
        this.setParticles()
        
        // Create bounding box for collision detection
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    setGeometry() {
        const radius = 0.2; // Width of the freezing pulse

        // Define a path for the freezing pulse (arc-like shape)
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-3, 0, 0),
            new THREE.Vector3(0, 3, 0),
            new THREE.Vector3(3, 0, 0)
        );

        // Create tube geometry along the curve to represent the slash
        this.geometry = new THREE.TubeGeometry(curve, 20, radius, 16, false);

        // Apply a 90-degree rotation on the X-axis to the geometry itself
        const rotationMatrix = new THREE.Matrix4().makeRotationX(Math.PI / 2);
        this.geometry.applyMatrix4(rotationMatrix);
    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            color: 0x00bfff, // Light blue color for Freezing Pulse
            emissive: 0x00bfff,
            emissiveIntensity: 0.5
        })
    }

    setMesh(position) {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.copy(position)
        this.mesh.castShadow = true
        this.scene.add(this.mesh)
    }

    setParticles() {
        const particleCount = 200;
        this.particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        // Initialize particle positions to match the freezing pulse position
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = this.mesh.position.x;
            positions[i * 3 + 1] = this.mesh.position.y;
            positions[i * 3 + 2] = this.mesh.position.z;
        }

        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.particleMaterial = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });

        this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.scene.add(this.particles);
    }


    updateParticles() {
        if (!this.particles) return;

        // Get the particle positions from the geometry
        const positions = this.particleGeometry.attributes.position.array;

        // Shift particle positions backward in the array (imitating a trail)
        for (let i = positions.length - 3; i >= 3; i -= 3) {
            positions[i] = positions[i - 3];
            positions[i + 1] = positions[i - 2];
            positions[i + 2] = positions[i - 1];
        }

        // Add some spread effect (width and height randomness)
        const spreadRange = 4;
        positions[0] = this.mesh.position.x + (Math.random() - 0.5) * spreadRange;
        positions[1] = this.mesh.position.y + Math.random();
        positions[2] = this.mesh.position.z + (Math.random() - 0.5) * spreadRange;

        // Mark the geometry for updates
        this.particleGeometry.attributes.position.needsUpdate = true;
    }



    update() {
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed))

        // Set the Y position to always be 1
        this.mesh.position.y = 0.1;

        // Rotate the mesh to face the direction of movement
        const velocity = new THREE.Vector3().add(this.direction).normalize()
        this.mesh.lookAt(this.mesh.position.clone().add(velocity)) // Align the front of the mesh to the direction

        // Update particle positions
        this.updateParticles()

        // Update the bounding box position after moving
        this.boundingBox.setFromObject(this.mesh);

        if (this.experience.time.current - this.startTime > this.lifeSpan) {
            this.destroy()
        }
    }

    destroy() {
        this.scene.remove(this.mesh)
        this.scene.remove(this.particles)
        this.geometry.dispose()
        this.material.dispose()
        this.particleGeometry.dispose()
        this.particleMaterial.dispose()
    }
}
