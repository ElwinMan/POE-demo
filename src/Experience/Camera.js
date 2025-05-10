import * as THREE from 'three'
import Experience from './Experience.js'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.setInstance()
        // this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 100);
        this.instance.position.set(0, 10, 10)
        this.scene.add(this.instance)
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        // Only try to access player if it exists
        if (!this.player) {
            this.player = this.experience.world.player;
        }

        if (this.player) {
            // Set the camera position relative to the player's current position
            const offset = new THREE.Vector3(4, 10, 4); // 10 units above, 10 units behind
            const targetPosition = this.player.mesh.position.clone().add(offset);

            // Smooth the camera movement using linear interpolation
            this.instance.position.lerp(targetPosition, 0.5);

            // Always look at the player
            this.instance.lookAt(this.player.mesh.position);
        }
    }
}