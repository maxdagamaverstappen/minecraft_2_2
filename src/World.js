// src/World.js
import { Chunk } from './Chunk.js';
import { BLOCKS } from './Blocks.js';

export class World {
    constructor(noise) {
        this.noise = noise;
        this.scene = null; // Será atribuído em main.js
        this.chunks = new Map();
        this.modifiedBlocks = new Map();
        
        this.chunkSize = 16;
        this.renderDistance = 8; // Em chunks
        
        this.textureLoader = new THREE.TextureLoader();
        this.textureAtlas = null;
    }

    async loadTextures() {
        this.textureAtlas = await this.textureLoader.loadAsync('assets/textures/atlas.png');
        this.textureAtlas.magFilter = THREE.NearestFilter;
        this.textureAtlas.minFilter = THREE.NearestFilter;
    }
    
    getChunkId(x, z) {
        return `${Math.floor(x / this.chunkSize)},${Math.floor(z / this.chunkSize)}`;
    }

    getChunkForPosition(pos) {
        return this.chunks.get(this.getChunkId(pos.x, pos.z));
    }
    
    generateInitialChunks(playerPosition) {
        this.update(playerPosition, true); // O `true` força a geração inicial
    }

    update(playerPosition, forceGenerate = false) {
        const currentChunkX = Math.floor(playerPosition.x / this.chunkSize);
        const currentChunkZ = Math.floor(playerPosition.z / this.chunkSize);

        // Carregar novos chunks
        for (let x = currentChunkX - this.renderDistance; x <= currentChunkX + this.renderDistance; x++) {
            for (let z = currentChunkZ - this.renderDistance; z <= currentChunkZ + this.renderDistance; z++) {
                const chunkId = `${x},${z}`;
                if (!this.chunks.has(chunkId)) {
                    const newChunk = new Chunk(x * this.chunkSize, z * this.chunkSize, this.chunkSize, this);
                    this.chunks.set(chunkId, newChunk);
                    this.scene.add(newChunk.mesh);
                }
            }
        }
        
        // Descarregar chunks distantes
        for (const [id, chunk] of this.chunks.entries()) {
            const [cx, cz] = id.split(',').map(Number);
            const distance = Math.sqrt((cx - currentChunkX)**2 + (cz - currentChunkZ)**2);
            if (distance > this.renderDistance + 2) {
                this.scene.remove(chunk.mesh);
                chunk.dispose();
                this.chunks.delete(id);
            }
        }
    }
    
    getBlock(x, y, z) {
        const worldX = Math.floor(x);
        const worldY = Math.floor(y);
        const worldZ = Math.floor(z);

        // Verificar modificações primeiro
        const modifiedBlockId = `${worldX},${worldY},${worldZ}`;
        if (this.modifiedBlocks.has(modifiedBlockId)) {
            return this.modifiedBlocks.get(modifiedBlockId);
        }

        const chunk = this.getChunkForPosition({x, z});
        return chunk ? chunk.getGeneratedBlock(worldX, worldY, worldZ) : BLOCKS.air;
    }

    setBlock(x, y, z, blockType) {
        const worldX = Math.floor(x);
        const worldY = Math.floor(y);
        const worldZ = Math.floor(z);

        // Salvar a modificação
        const modifiedBlockId = `${worldX},${worldY},${worldZ}`;
        this.modifiedBlocks.set(modifiedBlockId, blockType);

        // Atualizar o chunk afetado e vizinhos (se a mudança for na borda)
        const chunksToUpdate = new Set();
        chunksToUpdate.add(this.getChunkForPosition({ x: worldX, z: worldZ }));
        
        if (worldX % this.chunkSize === 0) chunksToUpdate.add(this.getChunkForPosition({ x: worldX - 1, z: worldZ }));
        if (worldX % this.chunkSize === this.chunkSize - 1) chunksToUpdate.add(this.getChunkForPosition({ x: worldX + 1, z: worldZ }));
        if (worldZ % this.chunkSize === 0) chunksToUpdate.add(this.getChunkForPosition({ x: worldX, z: worldZ - 1 }));
        if (worldZ % this.chunkSize === this.chunkSize - 1) chunksToUpdate.add(this.getChunkForPosition({ x: worldX, z: worldZ + 1 }));

        chunksToUpdate.forEach(chunk => {
            if (chunk) chunk.updateMesh();
        });
    }

    getSaveData() {
        return {
            modifiedBlocks: Object.fromEntries(this.modifiedBlocks)
        };
    }

    loadData(data) {
        this.modifiedBlocks = new Map(Object.entries(data.modifiedBlocks));
    }
}