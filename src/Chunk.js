// src/Chunk.js
import { BLOCKS } from './Blocks.js';

export class Chunk {
    constructor(startX, startZ, size, world) {
        this.startX = startX;
        this.startZ = startZ;
        this.size = size;
        this.world = world;
        
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.MeshLambertMaterial({
            map: this.world.textureAtlas,
            vertexColors: true,
            side: THREE.FrontSide
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(startX, 0, startZ);
        
        this.updateMesh();
    }
    
    getGeneratedBlock(worldX, worldY, worldZ) {
        const groundHeight = Math.floor(this.world.noise.noise2D(worldX / 50, worldZ / 50) * 10) + 30;
        
        if (worldY > groundHeight) return BLOCKS.air;
        if (worldY === groundHeight) return BLOCKS.grass;
        if (worldY > groundHeight - 5) return BLOCKS.dirt;
        return BLOCKS.stone;
    }

    updateMesh() {
        const positions = [];
        const normals = [];
        const uvs = [];
        const colors = [];

        for (let y = 0; y < 256; y++) {
            for (let z = 0; z < this.size; z++) {
                for (let x = 0; x < this.size; x++) {
                    const worldX = this.startX + x;
                    const worldZ = this.startZ + z;
                    const block = this.world.getBlock(worldX, y, worldZ);

                    if (block === BLOCKS.air) continue;
                    
                    const blockData = BLOCKS[Object.keys(BLOCKS).find(key => BLOCKS[key] === block)];

                    // Definir faces (front, back, top, bottom, left, right)
                    const faces = [
                        { dir: [ 0,  0,  1], corners: [[0,0,1], [1,0,1], [0,1,1], [1,1,1]], uv: blockData.uv.side }, // front
                        { dir: [ 0,  0, -1], corners: [[1,0,0], [0,0,0], [1,1,0], [0,1,0]], uv: blockData.uv.side }, // back
                        { dir: [ 0,  1,  0], corners: [[0,1,1], [1,1,1], [0,1,0], [1,1,0]], uv: blockData.uv.top },  // top
                        { dir: [ 0, -1,  0], corners: [[0,0,0], [1,0,0], [0,0,1], [1,0,1]], uv: blockData.uv.bottom }, // bottom
                        { dir: [-1,  0,  0], corners: [[0,0,0], [0,0,1], [0,1,0], [0,1,1]], uv: blockData.uv.side }, // left
                        { dir: [ 1,  0,  0], corners: [[1,0,1], [1,0,0], [1,1,1], [1,1,0]], uv: blockData.uv.side }, // right
                    ];

                    for (const { dir, corners, uv } of faces) {
                        const neighbor = this.world.getBlock(worldX + dir[0], y + dir[1], worldZ + dir[2]);
                        if (neighbor !== BLOCKS.air) continue; // Culling de faces internas

                        const ndx = positions.length / 3;
                        for (const pos of corners) {
                            positions.push(x + pos[0], y + pos[1], z + pos[2]);
                            normals.push(...dir);
                            colors.push(1, 1, 1); // Cor base
                        }
                        
                        // Adicionar UVs
                        const [u, v] = uv;
                        uvs.push(u, v + 0.0625, u + 0.0625, v + 0.0625, u, v, u + 0.0625, v);

                    }
                }
            }
        }

        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        this.geometry.computeBoundingSphere();
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}