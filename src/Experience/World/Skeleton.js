import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Skeleton {
    constructor(position = new THREE.Vector3()) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.health = 100
        this.maxHealth = 100
        this.dead = false

        // Set up geometry and material
        this.geometry = new THREE.BoxGeometry(1, 2, 1);
        this.material = new THREE.MeshStandardMaterial({ color: 0x888888 });

        // Create the mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.copy(position)
        this.mesh.castShadow = true
        this.mesh.name = "skeleton"
        this.scene.add(this.mesh)

        // Bounding Sphere for collision
        this.boundingSphere = new THREE.Sphere(this.mesh.position, 1)

        // Attach a health bar to the skeleton
        this.createHealthBar()
    }

    createHealthBar() {
        // Create the container
        this.healthBarContainer = document.createElement('div')
        this.healthBarContainer.style.position = 'absolute'
        this.healthBarContainer.style.width = '50px'
        this.healthBarContainer.style.height = '8px'
        this.healthBarContainer.style.backgroundColor = '#ff0000'
        this.healthBarContainer.style.borderRadius = '4px'
        this.healthBarContainer.style.overflow = 'hidden'
        this.healthBarContainer.style.pointerEvents = 'none'

        // Create the green bar
        this.healthBar = document.createElement('div')
        this.healthBar.style.width = '100%'
        this.healthBar.style.height = '100%'
        this.healthBar.style.backgroundColor = '#00ff00'

        this.healthBarContainer.appendChild(this.healthBar)
        document.body.appendChild(this.healthBarContainer)

        // Update its position
        this.updateHealthBarPosition()
    }

    updateHealthBarPosition() {
        // Project the 3D position to 2D
        const vector = new THREE.Vector3()
        vector.copy(this.mesh.position)
        vector.y += 1.5 // Offset above the skeleton's head
        vector.project(this.experience.camera.instance)

        // Convert to screen space
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight

        // Apply the new position to the health bar
        this.healthBarContainer.style.left = `${x - 25}px`
        this.healthBarContainer.style.top = `${y}px`
    }

    update() {
        if (this.dead) return;
        
        // If skeleton is dead, remove it
        if (this.health <= 0) {
            this.destroy()
        }

        // Update health bar position
        this.updateHealthBarPosition()
    }

    takeDamage(amount) {
        this.health -= amount
        console.log(`Skeleton took ${amount} damage! Remaining Health: ${this.health}`)
        const healthPercentage = Math.max((this.health / this.maxHealth) * 100, 0)
        this.healthBar.style.width = `${healthPercentage}%`
    }

    destroy() {
        this.dead = true
        this.scene.remove(this.mesh)

        // Remove health bar from the DOM
        if (this.healthBarContainer) {
            this.healthBarContainer.remove()
        }
        
        console.log('Skeleton destroyed!')
    }
}