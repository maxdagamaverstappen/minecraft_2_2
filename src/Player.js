// src/Player.js
import { BLOCKS } from './Blocks.js';

export class Player {
    constructor(scene) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 50, 0); // Posição inicial
        scene.add(this.camera);
        
        // Propriedades do jogador
        this.velocity = new THREE.Vector3();
        this.onGround = false;
        this.width = 0.8;
        this.height = 1.8;
        
        // Controles de movimento
        this.moveSpeed = 5;
        this.sprintSpeed = 10;
        this.jumpHeight = 8;
        this.gravity = -25;
        
        // Inventário
        this.hotbar = [BLOCKS.grass, BLOCKS.dirt, BLOCKS.stone, BLOCKS.wood, BLOCKS.leaves, BLOCKS.sand];
        this.selectedHotbarSlot = 0;
    }
    
    get position() {
        return this.camera.position;
    }

    applyGravity(deltaTime) {
        this.velocity.y += this.gravity * deltaTime;
    }

    handleCollisions(world) {
        const playerBox = new THREE.Box3().setFromCenterAndSize(
            this.position, 
            new THREE.Vector3(this.width, this.height, this.width)
        );

        const minX = Math.floor(playerBox.min.x);
        const maxX = Math.ceil(playerBox.max.x);
        const minY = Math.floor(playerBox.min.y);
        const maxY = Math.ceil(playerBox.max.y);
        const minZ = Math.floor(playerBox.min.z);
        const maxZ = Math.ceil(playerBox.max.z);

        this.onGround = false;

        for (let y = minY; y < maxY; y++) {
            for (let z = minZ; z < maxZ; z++) {
                for (let x = minX; x < maxX; x++) {
                    const blockId = world.getBlock(x, y, z);
                    const block = BLOCKS[blockId];

                    if (block && block.solid) {
                        const blockBox = new THREE.Box3().setFromObject(new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial())).translate(new THREE.Vector3(x,y,z));
                        
                        if (playerBox.intersectsBox(blockBox)) {
                           // Lógica de colisão simples (empurra o jogador para fora do bloco)
                           const overlap = playerBox.clone().intersect(blockBox);
                           const overlapSize = new THREE.Vector3();
                           overlap.getSize(overlapSize);

                           if(overlapSize.x < overlapSize.y && overlapSize.x < overlapSize.z) {
                               if(this.position.x > x) this.position.x += overlapSize.x;
                               else this.position.x -= overlapSize.x;
                               this.velocity.x = 0;
                           } else if (overlapSize.y < overlapSize.z) {
                               if(this.position.y > y) {
                                  this.position.y += overlapSize.y;
                                  this.onGround = true;
                               }
                               else this.position.y -= overlapSize.y;
                               this.velocity.y = 0;
                           } else {
                               if(this.position.z > z) this.position.z += overlapSize.z;
                               else this.position.z -= overlapSize.z;
                               this.velocity.z = 0;
                           }
                        }
                    }
                }
            }
        }
    }

    update(deltaTime, world) {
        this.applyGravity(deltaTime);
        
        // Atualiza posição baseada na velocidade
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        this.handleCollisions(world);

        // Zera velocidade horizontal para não deslizar
        this.velocity.x = 0;
        this.velocity.z = 0;
    }

    jump() {
        if (this.onGround) {
            this.velocity.y = this.jumpHeight;
        }
    }

    getSaveData() {
        return {
            position: this.position.toArray(),
            hotbar: this.hotbar,
            selectedHotbarSlot: this.selectedHotbarSlot
        };
    }

    loadData(data) {
        this.position.fromArray(data.position);
        this.hotbar = data.hotbar;
        this.selectedHotbarSlot = data.selectedHotbarSlot;
    }
}