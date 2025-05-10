import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Skeleton {
    constructor(position = new THREE.Vector3()) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.health = 100
        this.maxHealth = 100

        this.dead = false
        this.respawnTime = 3000; // 3 seconds for respawn
        this.respawnTimer = null;

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
        if (this.dead) {
            if (!this.respawnTimer) {
                // Start a respawn timer when the skeleton dies
                this.respawnTimer = setTimeout(() => {
                    this.respawn();
                }, this.respawnTime);
            }
            return; // Stop further updates if dead
        }
        
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

    respawn() {
        // Respawn at a random position
        const randomX = (Math.random() - 0.5) * 20; // Random X between -10 and 10
        const randomZ = (Math.random() - 0.5) * 20; // Random Z between -10 and 10
        
        // Set skeleton back to a new position
        this.mesh.position.set(randomX, 1, randomZ);

        // Reset health and state
        this.health = 100;
        this.dead = false;

        // Add skeleton back to the scene
        this.scene.add(this.mesh);
        console.log('Skeleton respawned!');
        
        // Recreate the health bar for the respawned skeleton
        this.createHealthBar();

        // Reset the respawn timer
        this.respawnTimer = null;
    }
}