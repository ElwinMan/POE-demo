import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Fireball {
    constructor(startPosition, direction) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.speed = 0.01 * this.experience.time.delta
        this.direction = direction
        this.lifeSpan = 2000 // 2 seconds
        this.startTime = this.experience.time.current
        this.exploded = false

        // Create the fireball
        this.setGeometry()
        this.setMaterial()
        this.setMesh(startPosition)

        // Particle trail
        this.setParticles()
    }

    setGeometry() {
        this.geometry = new THREE.SphereGeometry(0.2, 16, 16)
    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            color: 0xff4500,
            emissive: 0xff4500,
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
        const particleCount = 100
        this.particleGeometry = new THREE.BufferGeometry()
        const positions = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = this.mesh.position.x
            positions[i * 3 + 1] = this.mesh.position.y
            positions[i * 3 + 2] = this.mesh.position.z
        }

        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        this.particleMaterial = new THREE.PointsMaterial({
            color: 0xffa500,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        })

        this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial)
        this.scene.add(this.particles)
    }

    updateParticles() {
        if (this.exploded) return

        const positions = this.particleGeometry.attributes.position.array
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.1
            positions[i + 1] += (Math.random() - 0.5) * 0.1
            positions[i + 2] += (Math.random() - 0.5) * 0.1
        }

        this.particleGeometry.attributes.position.needsUpdate = true
    }

    update() {
        if (this.exploded) return
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed))

        // Set the Y position to always be 1
        this.mesh.position.y = 1;

        // Update particle positions to follow the fireball
        this.updateParticles()

        // Update particle geometry positions
        const positions = this.particleGeometry.attributes.position.array
        for (let i = positions.length - 3; i > 0; i -= 3) {
            positions[i] = positions[i - 3]
            positions[i + 1] = positions[i - 2]
            positions[i + 2] = positions[i - 1]
        }

        positions[0] = this.mesh.position.x
        positions[1] = this.mesh.position.y
        positions[2] = this.mesh.position.z

        if (this.experience.time.current - this.startTime > this.lifeSpan) {
            this.destroy()
        }
    }

    explode() {
        if (this.exploded) return
        this.exploded = true

        // Remove the fireball mesh
        this.scene.remove(this.mesh)

        // Create explosion effect
        const explosionGeometry = new THREE.SphereGeometry(0.5, 16, 16)
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            transparent: true,
            opacity: 0.7
        })
        const explosionMesh = new THREE.Mesh(explosionGeometry, explosionMaterial)
        explosionMesh.position.copy(this.mesh.position)
        this.scene.add(explosionMesh)

        // Expand and fade the explosion
        const duration = 300
        let elapsed = 0

        const animateExplosion = () => {
            if (elapsed < duration) {
                explosionMesh.scale.addScalar(0.05)
                explosionMaterial.opacity -= 0.02
                elapsed += 16
                requestAnimationFrame(animateExplosion)
            } else {
                this.scene.remove(explosionMesh)
                explosionGeometry.dispose()
                explosionMaterial.dispose()
                this.destroy()
            }
        }
        animateExplosion()
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
