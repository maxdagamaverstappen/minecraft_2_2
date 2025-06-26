import { Engine } from './src/Engine.js';
import { World } from './src/World.js';
import { Player } from './src/Player.js';
import { Controls } from './src/Controls.js';
import { UI } from './src/UI.js';
import { DataManager } from './src/DataManager.js';
import { BLOCKS } from './src/Blocks.js';

// ❌ REMOVA a linha de importação do SimplexNoise
// import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise';

// ✅ CORRIJA a inicialização para usar o objeto 'window'
const simplex = new window.SimplexNoise();

// Elementos do DOM
const canvas = document.getElementById('game-canvas');
const loadingScreen = document.getElementById('loading-screen');

// Componentes principais do Jogo (o resto do arquivo permanece igual)
const engine = new Engine(canvas);
const world = new World(simplex);
const player = new Player(engine.scene);
const controls = new Controls(player, canvas, world);
const ui = new UI();
const dataManager = new DataManager('my-minecraft-clone');

// ... o resto do código do main.js continua exatamente como antes ...

let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

async function setup() {
    await world.loadTextures();
    world.scene = engine.scene;
    const savedData = dataManager.load();
    if (savedData) {
        player.loadData(savedData.player);
        world.loadData(savedData.world);
    }
    world.generateInitialChunks(player.position);
    loadingScreen.style.display = 'none';
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    frameCount++;
    if (currentTime > lastTime + 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        ui.updateDebugInfo({ fps, pos: player.position, chunkCount: world.chunks.size });
    }
    controls.update(deltaTime);
    player.update(deltaTime, world);
    world.update(player.position);
    engine.update(deltaTime, player.camera);
    engine.render();
}

window.addEventListener('beforeunload', () => {
    const dataToSave = {
        player: player.getSaveData(),
        world: world.getSaveData()
    };
    dataManager.save(dataToSave);
});

setup();