import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Fireball {
    constructor(startPosition, direction) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.speed = 0.05
        this.direction = direction
        this.lifeSpan = 2000 // 2 seconds
        this.startTime = this.experience.time.current

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
        // Particle Geometry
        const particleCount = 100
        this.particleGeometry = new THREE.BufferGeometry()
        const positions = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = this.mesh.position.x
            positions[i * 3 + 1] = this.mesh.position.y
            positions[i * 3 + 2] = this.mesh.position.z
        }

        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        // Particle Material
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
        const positions = this.particleGeometry.attributes.position.array

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.1
            positions[i + 1] += (Math.random() - 0.5) * 0.1
            positions[i + 2] += (Math.random() - 0.5) * 0.1
        }

        this.particleGeometry.attributes.position.needsUpdate = true
    }

    update() {
        // Move the fireball
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed))

        // Sync particle position with the fireball
        this.updateParticles()
        
        const positions = this.particleGeometry.attributes.position.array
        for (let i = positions.length - 3; i > 0; i -= 3) {
            positions[i] = positions[i - 3]
            positions[i + 1] = positions[i - 2]
            positions[i + 2] = positions[i - 1]
        }

        // Place a new particle at the fireball's current position
        positions[0] = this.mesh.position.x
        positions[1] = this.mesh.position.y
        positions[2] = this.mesh.position.z

        // Lifetime check
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
