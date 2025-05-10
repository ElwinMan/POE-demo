import * as THREE from 'three'
import Experience from '../Experience.js'
import Fireball from './Fireball.js'
import FreezingPulse from './Freezingpulse.js'

export default class Player
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        // this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Movement variables
        this.keysPressed = {}
        this.speed = 0.005
        this.destination = null
        this.lastMousePosition = { x: 0, y: 0 };

        this.fireballs = []
        this.lastFireballTime = 0;  // Time when the last fireball was shot
        this.fireballCooldown = 1000; // 1 second cooldown

        this.freezingPulses = []
        this.lastFreezingPulseTime = 0;  // Time when the last fireball was shot
        this.freezingPulseCooldown = 1500; // 1 second cooldown

        // cube (player)
        this.setGeometry()
        this.setMaterial()
        this.setMesh()

        // Setup movement event listeners
        this.setEventListeners()

    }

    setGeometry()
    {
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    setMaterial()
    {
        this.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.y= 0.5;
        this.mesh.castShadow = true
        this.scene.add(this.mesh)
    }

    setEventListeners() {
        // Track mouse position
        window.addEventListener('mousemove', (event) => {
            this.lastMousePosition.x = event.clientX;
            this.lastMousePosition.y = event.clientY;
        });

        // Move on click
        window.addEventListener('click', (event) => {
            if (event.button === 0) { // Left click
                this.moveToClick(event);
            }
        });

        // Fireball on Q press
        window.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'q') {
                this.shootFireball();
            }
        });

        // Fireball on W press
        window.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'w') {
                this.shootFreezingPulse();
            }
        });
    }

    moveToClick(event) {
        // Get mouse position
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        // Raycasting to find the direction
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        // Check intersection with the ground
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        const groundHit = intersects.find((i) => i.object.name === "ground");

        if (groundHit) {
            // Set the new destination
            this.destination = groundHit.point;
        }
    }

    update() {
        if (this.destination) {
            const direction = new THREE.Vector3()
                .subVectors(this.destination, this.mesh.position)
                .normalize();

            // Move towards the destination
            const distance = this.mesh.position.distanceTo(this.destination);
            const moveDistance = Math.min(this.speed * this.time.delta, distance);

            if (distance > 0.1) {
                this.mesh.position.add(direction.multiplyScalar(moveDistance));
                this.mesh.position.y = 0.5; // keeps the player above ground
            } else {
                this.destination = null; // Arrived at destination
            }
        }

        // Update all fireballs
        this.fireballs.forEach(fireball => fireball.update());
        this.freezingPulses.forEach(freezingPulse => freezingPulse.update());
    }

    shootFireball() {
        // Check if the cooldown has passed (1 second)
        if (this.time.current - this.lastFireballTime < this.fireballCooldown) {
            return; // Do not shoot if within cooldown
        }

        // Update last fireball shot time
        this.lastFireballTime = this.time.current;

        // Get the current mouse position
        const mouse = new THREE.Vector2(
            (this.lastMousePosition.x / window.innerWidth) * 2 - 1,
            -(this.lastMousePosition.y / window.innerHeight) * 2 + 1
        );

        // Raycast from the camera to the mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        // Find where it intersects with the ground
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        const groundHit = intersects.find((i) => i.object.name === "ground");

        if (groundHit) {
            // Calculate direction
            const direction = groundHit.point.clone().sub(this.mesh.position).normalize();

            // Create and shoot the fireball
            const fireball = new Fireball(this.mesh.position.clone(), direction);
            this.fireballs.push(fireball);
        }

        this.startFireballCooldownUI();
    }

    shootFreezingPulse() {
        // Check if the cooldown has passed (1 second)
        if (this.time.current - this.lastFreezingPulseTime < this.freezingPulseCooldown) {
            return; // Do not shoot if within cooldown
        }

        // Update last freezingPulse shot time
        this.lastFreezingPulseTime = this.time.current;

        // Get the current mouse position
        const mouse = new THREE.Vector2(
            (this.lastMousePosition.x / window.innerWidth) * 2 - 1,
            -(this.lastMousePosition.y / window.innerHeight) * 2 + 1
        );

        // Raycast from the camera to the mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        // Find where it intersects with the ground
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        const groundHit = intersects.find((i) => i.object.name === "ground");

        if (groundHit) {
            // Calculate direction
            const direction = groundHit.point.clone().sub(this.mesh.position).normalize();

            // Create and shoot the freezingPulse
            const freezingPulse = new FreezingPulse(this.mesh.position.clone(), direction);
            this.freezingPulses.push(freezingPulse);
        }

        this.startFreezingPulseCooldownUI();
    }

    startFireballCooldownUI() {
        const overlay = document.getElementById('fireballCooldownOverlay');
        overlay.style.height = '100%';

        const interval = setInterval(() => {
            const elapsed = this.time.current - this.lastFireballTime;
            const percentage = Math.max(0, 100 - (elapsed / this.fireballCooldown) * 100);
            overlay.style.height = `${percentage}%`;

            if (percentage <= 0) {
                clearInterval(interval);
            }
        }, 50); // update every 50ms
    }

    startFreezingPulseCooldownUI() {
        const overlay = document.getElementById('freezingPulseCooldownOverlay');
        overlay.style.height = '100%';

        const interval = setInterval(() => {
            const elapsed = this.time.current - this.lastFreezingPulseTime;
            const percentage = Math.max(0, 100 - (elapsed / this.freezingPulseCooldown) * 100);
            overlay.style.height = `${percentage}%`;

            if (percentage <= 0) {
                clearInterval(interval);
            }
        }, 50); // update every 50ms
    }
}