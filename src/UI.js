// src/UI.js
import { BLOCKS } from './Blocks.js';

export class UI {
    constructor() {
        this.hotbarElement = document.getElementById('hotbar');
        this.fpsElement = document.getElementById('fps');
        this.posElement = document.getElementById('player-pos');
        this.chunkCountElement = document.getElementById('chunk-count');
        this.selectedBlockElement = document.getElementById('selected-block');
    }

    updateHotbar(hotbarItems, selectedIndex) {
        this.hotbarElement.innerHTML = '';
        hotbarItems.forEach((itemId, index) => {
            const slot = document.createElement('div');
            slot.classList.add('hotbar-slot');
            if (index === selectedIndex) {
                slot.classList.add('selected');
            }
            
            const blockData = BLOCKS[itemId];
            if (blockData) {
                const [u, v] = blockData.uv.side;
                slot.style.backgroundImage = `url(assets/textures/atlas.png)`;
                slot.style.backgroundSize = `${16 * 16}px ${16 * 16}px`;
                slot.style.backgroundPosition = `-${u * 16 * 16}px -${v * 16 * 16}px`;
            }
            this.hotbarElement.appendChild(slot);
        });
    }

    updateDebugInfo({ fps, pos, chunkCount }) {
        this.fpsElement.textContent = fps;
        this.posElement.textContent = `${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}`;
        this.chunkCountElement.textContent = chunkCount;
    }

    updateSelectedBlock(name) {
        this.selectedBlockElement.textContent = name;
    }
}