import * as THREE from 'three'
import Experience from '../Experience.js'
import Environment from './Environment.js'
import Floor from './Floor.js'
import Player from './Player.js'
import Skeleton from './Skeleton.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () =>
        {
            // Setup
            this.floor = new Floor()
            this.player = new Player()
            this.skeleton = new Skeleton(new THREE.Vector3(5, 0.5, -5))
            this.environment = new Environment()
            this.fireballs = this.player.fireballs
            this.skeletons = []
            this.spawnSkeletons()
        })
    }

    spawnSkeletons() {
        const skeleton1 = new Skeleton(new THREE.Vector3(5, 1, 5));
        const skeleton2 = new Skeleton(new THREE.Vector3(-5, 1, -5));
        
        this.skeletons.push(skeleton1, skeleton2)
    }

    update() {
        if (this.player) {
            this.player.update()
        }

        // Update all skeletons and fireballs
        if (this.skeleton) {
            this.skeletons.forEach(skeleton => skeleton.update());
            this.checkCollisions();
        }
    }

    checkCollisions() {
        this.fireballs.forEach((fireball, fIndex) => {
            this.skeletons.forEach((skeleton, sIndex) => {
                if (!skeleton.dead && fireball.mesh.position.distanceTo(skeleton.mesh.position) < 1.5) {
                    skeleton.takeDamage(50)
                    fireball.destroy()
                    this.fireballs.splice(fIndex, 1)  // Remove the fireball from the list
                }
            })
        })
    }
}