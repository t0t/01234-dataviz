document.addEventListener('DOMContentLoaded', () => {
    // Toggle sidebar y app
    const toggleButton = document.getElementById('toggle-sidebar');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            document.getElementById('app').classList.toggle('hidden');
            document.getElementById('sidebar').classList.toggle('open');
        });
    }

    // Inicializar el canvas de nodos
    const canvas = document.getElementById('nodes-canvas');
    const ctx = canvas.getContext('2d');

    // Ajustar tamaño del canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Iniciar animación de nodos
    const nodes = [];
    const numNodes = 20;
    const nodeRadius = 5;
    const connectionDistance = 150;

    // Crear nodos iniciales
    for (let i = 0; i < numNodes; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Actualizar y dibujar nodos
        nodes.forEach(node => {
            // Actualizar posición
            node.x += node.vx;
            node.y += node.vy;

            // Rebotar en los bordes
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

            // Dibujar nodo
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#2196F3';
            ctx.fill();
        });

        // Dibujar conexiones
        nodes.forEach((node, i) => {
            nodes.slice(i + 1).forEach(otherNode => {
                const dx = otherNode.x - node.x;
                const dy = otherNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(otherNode.x, otherNode.y);
                    ctx.strokeStyle = `rgba(33, 150, 243, ${1 - distance / connectionDistance})`;
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }

    animate();

    // Manejar el botón de inicio
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            document.querySelector('.hero').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');
            window.kb = new KnowledgeBase();
        });
    }
});