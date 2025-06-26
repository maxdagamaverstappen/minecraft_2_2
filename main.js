import { Engine } from './src/Engine.js';
import { World } from './src/World.js';
import { Player } from './src/Player.js';
import { Controls } from './src/Controls.js';
import { UI } from './src/UI.js';
import { DataManager } from './src/DataManager.js';
import { BLOCKS } from './src/Blocks.js';

// Inicialização do Simplex Noise
const simplex = new SimplexNoise();

// Elementos do DOM
const canvas = document.getElementById('game-canvas');
const loadingScreen = document.getElementById('loading-screen');

// Componentes principais do Jogo
const engine = new Engine(canvas);
const world = new World(simplex);
const player = new Player(engine.scene);
const controls = new Controls(player, canvas, world);
const ui = new UI();
const dataManager = new DataManager('my-minecraft-clone');

// Variáveis de controle do jogo
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

async function setup() {
    // Carregar texturas e dados
    await world.loadTextures();
    
    // Conectar o mundo ao motor de renderização
    world.scene = engine.scene;
    
    // Tentar carregar dados salvos
    const savedData = dataManager.load();
    if (savedData) {
        player.loadData(savedData.player);
        world.loadData(savedData.world);
    }

    // Gerar o mundo inicial em torno do jogador
    world.generateInitialChunks(player.position);
    
    // Esconder a tela de carregamento
    loadingScreen.style.display = 'none';

    // Iniciar o loop do jogo
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // DeltaTime em segundos

    // Atualizar FPS a cada segundo
    frameCount++;
    if (currentTime > lastTime + 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        ui.updateDebugInfo({ fps, pos: player.position, chunkCount: world.chunks.size });
    }
    
    // Atualizar componentes do jogo
    controls.update(deltaTime);
    player.update(deltaTime, world);
    world.update(player.position);
    engine.update(deltaTime, player.camera);

    engine.render();
}

// Lidar com salvamento ao fechar a aba
window.addEventListener('beforeunload', () => {
    const dataToSave = {
        player: player.getSaveData(),
        world: world.getSaveData()
    };
    dataManager.save(dataToSave);
});

// Iniciar o jogo
setup();