// src/Engine.js
export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Cor do céu
        this.renderer.shadowMap.enabled = true;
        
        // Cena
        this.scene = new THREE.Scene();

        // Câmera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Iluminação
        this.setupLighting();

        // Controle de Tempo (Ciclo Dia/Noite)
        this.dayCycle = {
            duration: 600, // 10 minutos para um ciclo completo
            time: 0,
        };
        
        // Event Listener para redimensionar a tela
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }
    
    setupLighting() {
        // Luz Ambiente
        this.ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
        this.scene.add(this.ambientLight);
        
        // Luz Direcional (Sol)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(50, 200, 100);
        this.directionalLight.castShadow = true;
        
        // Configurações da Sombra
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        
        this.scene.add(this.directionalLight);
    }
    
    update(deltaTime, playerCamera) {
        // Sincronizar câmera do motor com a do jogador
        this.camera.position.copy(playerCamera.position);
        this.camera.quaternion.copy(playerCamera.quaternion);

        // Atualizar ciclo dia/noite
        this.dayCycle.time += deltaTime;
        const phase = (this.dayCycle.time / this.dayCycle.duration) * 2 * Math.PI;

        this.directionalLight.position.x = 200 * Math.cos(phase);
        this.directionalLight.position.y = 200 * Math.sin(phase);

        if (this.directionalLight.position.y < 0) {
            // Noite
            this.directionalLight.intensity = 0.1;
            this.ambientLight.intensity = 0.2;
            this.renderer.setClearColor(0x000033); // Céu noturno
        } else {
            // Dia
            this.directionalLight.intensity = 0.8;
            this.ambientLight.intensity = 0.5;
            this.renderer.setClearColor(0x87CEEB); // Céu diurno
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}