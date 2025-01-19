let nodes = [];

// Mapeo de tags a colores
const colors = [
    'white',
    'yellow',
    'red',
    'blue',
    'brown'
];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('nodes-canvas');
    
    // Crear 5 nodos en posiciones fijas
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 200;  // Radio del círculo grande donde se colocarán los nodos
    
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * PI) / 5 - PI/2;  // -PI/2 para que el primer nodo esté arriba
        nodes.push({
            x: centerX + radius * cos(angle),
            y: centerY + radius * sin(angle),
            color: colors[i]
        });
    }
}

function draw() {
    background(44);
    
    // Dibujar líneas entre nodos
    stroke(100);
    strokeWeight(2);
    for (let i = 0; i < nodes.length; i++) {
        const nextIndex = (i + 1) % nodes.length;
        line(nodes[i].x, nodes[i].y, nodes[nextIndex].x, nodes[nextIndex].y);
    }
    
    // Dibujar círculos
    noStroke();
    nodes.forEach(node => {
        fill(node.color);
        circle(node.x, node.y, 40);
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Recalcular posiciones
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 200;
    
    nodes.forEach((node, i) => {
        const angle = (i * 2 * PI) / 5 - PI/2;
        node.x = centerX + radius * cos(angle);
        node.y = centerY + radius * sin(angle);
    });
}