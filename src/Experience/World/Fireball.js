import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Fireball {
    constructor(position, direction) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.speed = 5
        this.life = 100

        // Geometry and material
        this.geometry = new THREE.SphereGeometry(0.2, 16, 16)
        this.material = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff4400 })
        
        // Mesh setup
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.copy(position)
        this.scene.add(this.mesh)

        // Store direction
        this.direction = direction.clone().normalize()
    }

    update() {
        // Move the fireball forward
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * 0.016))
        
        // Decrease life and remove if out of time
        this.life -= 1
        if (this.life <= 0) {
            this.destroy()
        }
    }

    destroy() {
        this.scene.remove(this.mesh)
    }
}
