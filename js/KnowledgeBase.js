document.addEventListener('DOMContentLoaded', () => {
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

    // Variables para la animación
    const nodes = [];
    const numNodes = 50;
    const nodeRadius = 2;
    const maxSpeed = 0.5;

    // Crear nodos iniciales
    for (let i = 0; i < numNodes; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            dx: (Math.random() - 0.5) * maxSpeed,
            dy: (Math.random() - 0.5) * maxSpeed
        });
    }

    // Función de animación
    function animate() {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Actualizar y dibujar nodos
        ctx.fillStyle = '#ffffff';
        nodes.forEach(node => {
            // Actualizar posición
            node.x += node.dx;
            node.y += node.dy;

            // Rebotar en los bordes
            if (node.x < 0 || node.x > canvas.width) node.dx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.dy *= -1;

            // Dibujar nodo
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Dibujar líneas a nodos cercanos
            nodes.forEach(otherNode => {
                const dx = otherNode.x - node.x;
                const dy = otherNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(otherNode.x, otherNode.y);
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }

    animate();
});