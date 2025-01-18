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
    const nodeRadius = 10;  // Tamaño base aumentado a 50px
    const hoverRadius = 500;  // Tamaño hover aumentado a 500px
    const maxSpeed = 0.5;

    let hoveredNode = null;
    let selectedNode = null;
    let isDragging = false;

    // Función para añadir un nuevo nodo
    function addNode(entry) {
        nodes.push({
            id: entry.id || Date.now(),
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            dx: (Math.random() - 0.5) * maxSpeed,
            dy: (Math.random() - 0.5) * maxSpeed,
            content: entry.content,
            title: entry.title || entry.content.split('\n')[0] || 'Sin título',
            tags: entry.tags || []
        });
    }

    // Detectar nodo bajo el cursor y manejar arrastre
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

        // Actualizar nodo arrastrado
        if (isDragging && selectedNode) {
            selectedNode.x = x;
            selectedNode.y = y;
        }

        // Actualizar nodo hover
        hoveredNode = nodes.find(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            return Math.sqrt(dx * dx + dy * dy) < nodeRadius;
        });
    });

    canvas.addEventListener('mouseup', () => {
        if (selectedNode) {
            // Reiniciar movimiento con velocidad aleatoria
            selectedNode.dx = (Math.random() - 0.5) * maxSpeed;
            selectedNode.dy = (Math.random() - 0.5) * maxSpeed;
        }
        isDragging = false;
        selectedNode = null;
    });

    // Función de animación
    function animate() {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Actualizar y dibujar nodos
        ctx.fillStyle = '#ffffff';
        nodes.forEach(node => {
            // Actualizar posición solo si no está siendo arrastrado
            if (!isDragging || node !== selectedNode) {
                node.x += node.dx;
                node.y += node.dy;

                // Rebotar en los bordes
                if (node.x < nodeRadius || node.x > canvas.width - nodeRadius) node.dx *= -1;
                if (node.y < nodeRadius || node.y > canvas.height - nodeRadius) node.dy *= -1;
            }

            // Dibujar nodo
            ctx.beginPath();
            const radius = node === hoveredNode ? hoverRadius : nodeRadius;
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Dibujar líneas a nodos cercanos con tags similares
            nodes.forEach(otherNode => {
                if (node === otherNode) return;
                
                // Comprobar si comparten tags
                const sharedTags = node.tags.some(tag => otherNode.tags.includes(tag));
                if (!sharedTags) return;

                const dx = otherNode.x - node.x;
                const dy = otherNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {  // Aumentado para que se vean más conexiones
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 200})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(otherNode.x, otherNode.y);
                    ctx.stroke();
                }
            });

            // Si el nodo está seleccionado, mostrar su título
            if (node === hoveredNode) {
                ctx.font = '12px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(node.title, node.x, node.y + radius + 20);
            }
        });

        requestAnimationFrame(animate);
    }

    // Manejar el guardado de entradas
    const saveButton = document.querySelector('.action-button.primary');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const editorInput = document.querySelector('.editor-input');
            const tagsInput = document.querySelector('.tags-input');
            
            if (editorInput && tagsInput) {
                const entry = {
                    id: Date.now(),
                    content: editorInput.value,
                    tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
                    title: editorInput.value.split('\n')[0] || 'Sin título'
                };

                // Guardar en localStorage
                const entries = JSON.parse(localStorage.getItem('entries') || '[]');
                entries.push(entry);
                localStorage.setItem('entries', JSON.stringify(entries));

                // Añadir al canvas
                addNode(entry);

                // Limpiar formulario
                editorInput.value = '';
                tagsInput.value = '';
            }
        });
    }

    // Cargar datos desde data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(entry => addNode(entry));
        })
        .catch(error => console.error('Error cargando data.json:', error));

    animate();
});