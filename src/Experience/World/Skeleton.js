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

        this.freezeDuration = 0
        this.freezeTime = 0

        // Set up geometry and material
        this.geometry = new THREE.BoxGeometry(1, 2, 1);
        this.material = new THREE.MeshStandardMaterial({ color: 0x888888 });

        // Create the mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.copy(position)
        this.mesh.castShadow = true
        this.mesh.name = "skeleton"
        this.scene.add(this.mesh)

        // Bounding box for collision
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);

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

        // Apply freezing effect
        if (this.freezeDuration > 0) {
            const elapsed = this.experience.time.current - this.freezeTime
            if (elapsed >= this.freezeDuration) {
                this.freezeDuration = 0 // Stop freezing after duration
            } else {
                // Apply freezing effect (slowing down movement or stopping)
                this.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
            }
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

    freeze(duration) {
        if (this.isFrozen) return; // Prevent re-freezing if already frozen
        this.isFrozen = true;

        // Store the original material color
        this.originalColor = this.mesh.material.color.clone();

        // Target blueish color
        const targetColor = new THREE.Color(0x1e90ff);

        // Animation properties
        const freezeStart = performance.now();
        const freezeEnd = freezeStart + duration;

        const animateFreeze = (time) => {
            if (time < freezeEnd) {
                // Calculate the progress (0 to 1)
                const progress = (time - freezeStart) / duration;

                // Lerp (linear interpolation) between the original color and target color
                this.mesh.material.color.lerpColors(this.originalColor, targetColor, Math.min(progress, 1));

                requestAnimationFrame(animateFreeze);
            } else {
                // Ensure final color is fully applied
                this.mesh.material.color.copy(targetColor);

                // Set a timeout to unfreeze
                setTimeout(() => {
                    this.unfreeze();
                }, duration);
            }
        };

        requestAnimationFrame(animateFreeze);
    }

    unfreeze() {
        if (!this.isFrozen) return;
        this.isFrozen = false;

        // Smoothly transition back to the original color
        const transitionDuration = 500; // 0.5 second transition
        const transitionStart = performance.now();
        const transitionEnd = transitionStart + transitionDuration;

        const animateUnfreeze = (time) => {
            if (time < transitionEnd) {
                // Calculate progress
                const progress = (time - transitionStart) / transitionDuration;

                // Lerp back to the original color
                this.mesh.material.color.lerpColors(new THREE.Color(0x1e90ff), this.originalColor, Math.min(progress, 1));
                requestAnimationFrame(animateUnfreeze);
            } else {
                this.mesh.material.color.copy(this.originalColor);
            }
        };

        requestAnimationFrame(animateUnfreeze);
    }

    destroy() {
        this.dead = true;
        this.scene.remove(this.mesh);
        
        // Reset freezing state
        this.freezeDuration = 0;
        this.isFrozen = false;
        this.freezeTime = 0;

        // Reset to original color
        if (this.originalColor) {
            this.mesh.material.color.copy(this.originalColor);
        }

        // Remove health bar from the DOM
        if (this.healthBarContainer) {
            this.healthBarContainer.remove();
        }
        
        console.log('Skeleton destroyed!');
    }

    respawn() {
        console.log('Respawning skeleton...');

        // Respawn at a random position
        const randomX = (Math.random() - 0.5) * 20; // Random Z between -10 and 10
        const randomZ = (Math.random() - 0.5) * 20; // Random Z between -10 and 10
        this.mesh.position.set(randomX, 1, randomZ);
        this.scene.add(this.mesh);

        // Reset health and state
        this.health = 100;
        this.dead = false;

        // Reset freezing state
        this.freezeDuration = 0;
        this.isFrozen = false;
        this.freezeTime = 0;
        if (this.originalColor) {
            this.mesh.material.color.copy(this.originalColor);
        }

        // Re-create the health bar
        this.createHealthBar();

        // Update the bounding box after respawn
        this.boundingBox.setFromObject(this.mesh);

        this.respawnTimer = null;

        console.log('Skeleton respawned!');
    }
}