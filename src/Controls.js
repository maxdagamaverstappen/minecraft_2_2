// src/Controls.js
import { UI } from './UI.js';
import { BLOCKS } from './Blocks.js';

export class Controls {
    constructor(player, canvas, world) {
        this.player = player;
        this.canvas = canvas;
        this.world = world;
        this.ui = new UI();
        this.keys = {};

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.pitch = new THREE.Object3D();
        this.pitch.add(this.player.camera);
        
        this.yaw = new THREE.Object3D();
        this.yaw.position.y = this.player.height;
        this.yaw.add(this.pitch);
        this.player.camera.add(this.yaw);


        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);

        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                document.addEventListener("mousemove", this.onMouseMove.bind(this), false);
                document.addEventListener('mousedown', this.onMouseDown.bind(this));
                document.addEventListener('wheel', this.onMouseWheel.bind(this));
            } else {
                document.removeEventListener("mousemove", this.onMouseMove.bind(this), false);
                document.removeEventListener('mousedown', this.onMouseDown.bind(this));
                document.removeEventListener('wheel', this.onMouseWheel.bind(this));
            }
        });
        
        this.ui.updateHotbar(this.player.hotbar, this.player.selectedHotbarSlot);
        this.updateSelectedBlockInfo();
    }
    
    onMouseMove(event) {
        if (document.pointerLockElement !== this.canvas) return;
        
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;
        
        // Rotaciona a câmera horizontalmente (yaw)
        this.player.camera.rotation.y -= movementX * 0.002;
        // Rotaciona verticalmente (pitch) e limita o ângulo
        this.player.camera.rotation.x -= movementY * 0.002;
        this.player.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.camera.rotation.x));
    }

    onMouseDown(event) {
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.player.camera);
        const intersects = this.raycaster.intersectObjects(this.world.scene.children);
        
        if (intersects.length > 0) {
            const intersection = intersects[0];
            const pos = intersection.point.clone();
            const normal = intersection.face.normal.clone();

            if (event.button === 0) { // Click Esquerdo - Remover Bloco
                const blockPos = pos.sub(normal.multiplyScalar(0.5));
                this.world.setBlock(blockPos.x, blockPos.y, blockPos.z, BLOCKS.air);
            } else if (event.button === 2) { // Click Direito - Colocar Bloco
                const blockToPlace = this.player.hotbar[this.player.selectedHotbarSlot];
                if (blockToPlace !== BLOCKS.air) {
                    const blockPos = pos.add(normal.multiplyScalar(0.5));
                    this.world.setBlock(blockPos.x, blockPos.y, blockPos.z, blockToPlace);
                }
            }
        }
    }
    
    onMouseWheel(event) {
        if (event.deltaY > 0) { // Rolar para baixo
            this.player.selectedHotbarSlot = (this.player.selectedHotbarSlot + 1) % this.player.hotbar.length;
        } else { // Rolar para cima
            this.player.selectedHotbarSlot = (this.player.selectedHotbarSlot - 1 + this.player.hotbar.length) % this.player.hotbar.length;
        }
        this.ui.updateHotbar(this.player.hotbar, this.player.selectedHotbarSlot);
        this.updateSelectedBlockInfo();
    }
    
    updateSelectedBlockInfo() {
        const selectedBlockId = this.player.hotbar[this.player.selectedHotbarSlot];
        const blockName = BLOCKS[selectedBlockId] ? BLOCKS[selectedBlockId].name : 'Empty';
        this.ui.updateSelectedBlock(blockName);
    }
    
    update(deltaTime) {
        const speed = this.keys['ShiftLeft'] ? this.player.sprintSpeed : this.player.moveSpeed;
        const moveDirection = new THREE.Vector3();

        if (this.keys['KeyW']) moveDirection.z = -1;
        if (this.keys['KeyS']) moveDirection.z = 1;
        if (this.keys['KeyA']) moveDirection.x = -1;
        if (this.keys['KeyD']) moveDirection.x = 1;

        moveDirection.normalize();
        moveDirection.applyEuler(this.player.camera.rotation);

        this.player.velocity.x = moveDirection.x * speed;
        this.player.velocity.z = moveDirection.z * speed;
        
        if (this.keys['Space']) {
            this.player.jump();
        }
    }
}