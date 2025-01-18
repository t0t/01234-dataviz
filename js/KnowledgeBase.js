document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('nodes-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const nodes = [];
    const nodeRadius = 30;
    const hoverRadius = 45;
    const maxSpeed = 0.5;

    let hoveredNode = null;
    let selectedNode = null;
    let isDragging = false;

    // Planetas de ejemplo
    const planets = [
        { id: 1, title: "Mercurio", color: "#FFB266", tags: ["rocoso", "pequeño"] },
        { id: 2, title: "Venus", color: "#FFA500", tags: ["rocoso", "caliente"] },
        { id: 3, title: "Tierra", color: "#4169E1", tags: ["rocoso", "habitable"] },
        { id: 4, title: "Marte", color: "#FF4500", tags: ["rocoso", "frío"] },
        { id: 5, title: "Júpiter", color: "#DEB887", tags: ["gaseoso", "grande"] },
        { id: 6, title: "Saturno", color: "#FFC080", tags: ["gaseoso", "anillos"] },
        { id: 7, title: "Urano", color: "#ADD8E6", tags: ["gaseoso", "helado"] },
        { id: 8, title: "Neptuno", color: "#6495ED", tags: ["gaseoso", "helado"] }
    ];

    // Añadir planetas al canvas
    planets.forEach(planet => {
        nodes.push({
            ...planet,
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50,
            dx: (Math.random() - 0.5) * maxSpeed,
            dy: (Math.random() - 0.5) * maxSpeed
        });
    });

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        selectedNode = nodes.find(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            return Math.sqrt(dx * dx + dy * dy) < nodeRadius;
        });

        if (selectedNode) {
            isDragging = true;
            selectedNode.dx = 0;
            selectedNode.dy = 0;
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDragging && selectedNode) {
            selectedNode.x = x;
            selectedNode.y = y;
        }

        hoveredNode = nodes.find(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            return Math.sqrt(dx * dx + dy * dy) < nodeRadius;
        });
    });

    canvas.addEventListener('mouseup', () => {
        if (selectedNode) {
            selectedNode.dx = (Math.random() - 0.5) * maxSpeed;
            selectedNode.dy = (Math.random() - 0.5) * maxSpeed;
        }
        isDragging = false;
        selectedNode = null;
    });

    function animate() {
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar conexiones primero
        nodes.forEach(node => {
            nodes.forEach(otherNode => {
                if (node === otherNode) return;
                
                const sharedTags = node.tags.some(tag => otherNode.tags.includes(tag));
                if (!sharedTags) return;

                const dx = otherNode.x - node.x;
                const dy = otherNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 300) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 - distance / 400})`;
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(otherNode.x, otherNode.y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            });
        });

        // Luego dibujar los planetas
        nodes.forEach(node => {
            if (!isDragging || node !== selectedNode) {
                node.x += node.dx;
                node.y += node.dy;

                if (node.x < nodeRadius || node.x > canvas.width - nodeRadius) node.dx *= -1;
                if (node.y < nodeRadius || node.y > canvas.height - nodeRadius) node.dy *= -1;
            }

            // Dibujar planeta
            ctx.beginPath();
            const radius = node === hoveredNode ? hoverRadius : nodeRadius;
            
            // Crear gradiente para efecto 3D
            const gradient = ctx.createRadialGradient(
                node.x - radius/3, node.y - radius/3, 0,
                node.x, node.y, radius
            );
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, '#000000');
            
            ctx.fillStyle = gradient;
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Añadir brillo
            ctx.beginPath();
            ctx.arc(node.x - radius/3, node.y - radius/3, radius/4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();

            // Mostrar nombre del planeta
            if (node === hoveredNode) {
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(node.title, node.x, node.y + radius + 25);
                
                // Mostrar tags
                ctx.font = '12px Arial';
                ctx.fillText(node.tags.join(' - '), node.x, node.y + radius + 45);
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
});