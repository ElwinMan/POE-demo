import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Skeleton {
    constructor(position = new THREE.Vector3()) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.health = 100
        this.dead = false

        // Set up geometry and material
        this.geometry = new THREE.BoxGeometry(1, 2, 1);
        this.material = new THREE.MeshStandardMaterial({ color: 0x888888 });

        // Create the mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.copy(position)
        this.mesh.castShadow = true
        this.scene.add(this.mesh)

        // Bounding Sphere for collision
        this.boundingSphere = new THREE.Sphere(this.mesh.position, 1)
    }

    update() {
        if (this.dead) return;
        
        // If skeleton is dead, remove it
        if (this.health <= 0) {
            this.destroy()
        }
    }

    takeDamage(amount) {
        this.health -= amount
        console.log(`Skeleton took ${amount} damage! Remaining Health: ${this.health}`)
    }

    destroy() {
        this.dead = true
        this.scene.remove(this.mesh)
        console.log('Skeleton destroyed!')
    }
}