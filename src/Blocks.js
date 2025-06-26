// src/Blocks.js
const ATLAS_SIZE = 16; // 16x16 texturas no atlas
const TILE_SIZE = 1 / ATLAS_SIZE;

function getUV(x, y) {
    return [x * TILE_SIZE, 1 - (y + 1) * TILE_SIZE];
}

export const BLOCKS = {
    air: 0,
    grass: 1,
    dirt: 2,
    stone: 3,
    wood: 4,
    leaves: 5,
    sand: 6,
    
    // Mapeamento de ID para propriedades (incluindo coordenadas UV no atlas)
    1: { name: 'grass', solid: true, uv: { top: getUV(0,0), bottom: getUV(2,0), side: getUV(1,0) } },
    2: { name: 'dirt', solid: true, uv: { top: getUV(2,0), bottom: getUV(2,0), side: getUV(2,0) } },
    3: { name: 'stone', solid: true, uv: { top: getUV(3,0), bottom: getUV(3,0), side: getUV(3,0) } },
    4: { name: 'wood', solid: true, uv: { top: getUV(4,0), bottom: getUV(4,0), side: getUV(5,0) } },
    5: { name: 'leaves', solid: true, uv: { top: getUV(6,0), bottom: getUV(6,0), side: getUV(6,0) } },
    6: { name: 'sand', solid: true, uv: { top: getUV(7,0), bottom: getUV(7,0), side: getUV(7,0) } },
};