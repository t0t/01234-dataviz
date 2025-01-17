class KnowledgeBase {
    constructor() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.currentEntry = null;
        this.nodeRadius = 20;
        this.padding = 40;
        this.center = { x: this.width / 2, y: this.height / 2 };
        this.orbitRadius = Math.min(this.width, this.height) / 3;
        
        this.setupGraph();
        this.loadData().then(() => {
            this.setupEventListeners();
            this.renderEntries();
        });

        window.kb = this;
    }

    setupGraph() {
        this.svg = d3.select("#canvas")
            .attr("width", this.width)
            .attr("height", this.height);

        // Añadir órbita
        this.svg.append("circle")
            .attr("class", "orbit")
            .attr("cx", this.center.x)
            .attr("cy", this.center.y)
            .attr("r", this.orbitRadius)
            .style("fill", "none")
            .style("stroke", "#fff")
            .style("stroke-opacity", 0.1);

        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id)
                .distance(100)
                .strength(0.2))
            .force("charge", d3.forceManyBody()
                .strength(-150)
                .distanceMax(300))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collision", d3.forceCollide().radius(40))
            .alphaDecay(0.05) // Más lento pero más estable
            .velocityDecay(0.4); // Más amortiguación

        this.g = this.svg.append("g");

        // Zoom mejorado
        const zoom = d3.zoom()
            .extent([[0, 0], [this.width, this.height]])
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                this.g.attr("transform", event.transform);
            });

        this.svg.call(zoom);
        
        // Doble click para centrar
        this.svg.on("dblclick.zoom", () => {
            this.svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        });
    }

    async loadData() {
        try {
            // Cargar datos estáticos
            this.data = {
                "entries": [
                    {
                        "id": "1737134810672",
                        "content": "rthwrhrw",
                        "tags": [],
                        "created": "2025-01-17T17:26:50.672Z",
                        "modified": "2025-01-17T17:26:50.672Z"
                    },
                    {
                        "id": "1737134808355",
                        "content": "rwthrthr",
                        "tags": [],
                        "created": "2025-01-17T17:26:48.355Z",
                        "modified": "2025-01-17T17:26:48.355Z"
                    },
                    {
                        "id": "1737134806454",
                        "content": "thrwht",
                        "tags": [
                            "agua"
                        ],
                        "created": "2025-01-17T17:26:46.455Z",
                        "modified": "2025-01-17T17:26:46.455Z"
                    },
                    {
                        "id": "1737134804272",
                        "content": "wrth",
                        "tags": [
                            "wrth",
                            "agua"
                        ],
                        "created": "2025-01-17T17:26:44.272Z",
                        "modified": "2025-01-17T17:26:44.272Z"
                    },
                    {
                        "id": "1737134800264",
                        "content": "wrht",
                        "tags": [
                            "we"
                        ],
                        "created": "2025-01-17T17:26:40.264Z",
                        "modified": "2025-01-17T17:26:40.265Z"
                    }
                ],
                "metadata": {
                    "lastUpdate": "2025-01-17T18:19:15",
                    "version": "1.0"
                }
            };
            
            // Crear enlaces basados en contenido común
            this.links = [];
            const entries = Object.values(this.data.entries);
            
            entries.forEach((source, i) => {
                entries.slice(i + 1).forEach(target => {
                    // Buscar palabras comunes en el contenido
                    const sourceWords = source.content.toLowerCase().split(/\s+/);
                    const targetWords = target.content.toLowerCase().split(/\s+/);
                    const commonWords = sourceWords.filter(word => 
                        word.length > 4 && targetWords.includes(word)
                    );
                    
                    // Buscar tags comunes
                    const commonTags = source.tags.filter(tag => 
                        target.tags.includes(tag)
                    );
                    
                    // Si hay palabras o tags en común, crear enlace
                    if (commonWords.length > 0 || commonTags.length > 0) {
                        this.links.push({
                            source: source.id,
                            target: target.id,
                            value: commonWords.length + commonTags.length,
                            commonWords,
                            commonTags
                        });
                    }
                });
            });
            
            this.updateGraph();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    updateGraph() {
        const nodes = this.data.entries;
        const links = this.links;

        this.g.selectAll("*").remove();
        this.drawLinks(links);
        this.drawNodes(nodes);
        this.setupSimulation(nodes, links);
    }

    drawLinks(links) {
        return this.g.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("class", "link");
    }

    drawNodes(nodes) {
        const node = this.g.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", this.dragstarted.bind(this))
                .on("drag", this.dragged.bind(this))
                .on("end", this.dragended.bind(this)));

        // Círculo base
        node.append("circle")
            .attr("r", this.nodeRadius);

        // Texto del nodo
        node.append("text")
            .attr("dy", ".35em")
            .text(d => d.content.substring(0, 15) + "...");

        // Evento de clic
        node.on("click", (event, d) => {
            event.stopPropagation();
            this.handleNodeClick(event, d);
        });

        return node;
    }

    handleNodeClick(event, d) {
        // Desactivar cualquier nodo expandido previamente
        const wasExpanded = d3.select(event.currentTarget).classed("expanded");
        this.g.selectAll(".node").classed("expanded", false);
        
        if (!wasExpanded) {
            // Expandir el nodo actual
            d3.select(event.currentTarget).classed("expanded", true);
            
            // Mostrar detalles en el sidebar
            const sidebar = document.getElementById('sidebar');
            const entryDetails = document.getElementById('entry-details');
            
            const formattedDate = new Date(d.modified).toLocaleString();
            
            entryDetails.innerHTML = `
                <div class="entry-item">
                    <div class="entry-content">${d.content}</div>
                    <div class="entry-meta">Modified: ${formattedDate}</div>
                    <div class="entry-tags">
                        ${d.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            
            sidebar.classList.add('open');
            document.getElementById('toggle-sidebar').classList.add('active');
        } else {
            // Cerrar sidebar
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('toggle-sidebar').classList.remove('active');
        }
    }

    setupSimulation(nodes, links) {
        // Detener simulación anterior si existe
        if (this.simulation) this.simulation.stop();

        this.simulation
            .nodes(nodes)
            .force("link").links(links);

        // Añadir fuerza de colisión
        this.simulation.force("collision", d3.forceCollide().radius(this.nodeRadius * 2));

        // Fuerza de centro
        this.simulation.force("center", d3.forceCenter(this.width / 2, this.height / 2));

        // Mantener nodos dentro de los límites
        this.simulation.force("bounds", () => {
            nodes.forEach(node => {
                node.x = Math.max(this.nodeRadius, Math.min(this.width - this.nodeRadius, node.x));
                node.y = Math.max(this.nodeRadius, Math.min(this.height - this.nodeRadius, node.y));
            });
        });

        this.simulation.on("tick", () => {
            // Actualizar posición de enlaces
            this.g.selectAll(".link")
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            // Actualizar posición de nodos
            this.g.selectAll(".node")
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Reiniciar simulación
        this.simulation.alpha(1).restart();
    }

    dragstarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragended(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('toggle-sidebar');
        const sidebar = document.getElementById('sidebar');
        
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            toggleBtn.classList.toggle('active');
        });
        document.getElementById('save').addEventListener('click', () => this.saveEntry());
        document.getElementById('new-entry').addEventListener('click', () => this.newEntry());
        document.getElementById('export-pdf').addEventListener('click', () => this.exportToPDF());
        window.addEventListener('resize', () => this.onResize());
    }

    async saveData() {
        try {
            const response = await fetch('save', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data)
            });
            if (!response.ok) throw new Error('Error saving data');
            this.renderEntries();
            this.updateGraph();
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    saveEntry() {
        const content = document.getElementById('content-editor').value;
        const tags = document.getElementById('tags-input').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);

        if (!content) return;

        const entry = {
            id: this.currentEntry?.id || Date.now().toString(),
            content,
            tags,
            created: this.currentEntry?.created || new Date().toISOString(),
            modified: new Date().toISOString()
        };

        if (this.currentEntry) {
            const index = this.data.entries.findIndex(e => e.id === this.currentEntry.id);
            this.data.entries[index] = entry;
        } else {
            this.data.entries.unshift(entry);
        }

        this.saveData();
        this.clearEditor();
    }

    newEntry() {
        this.currentEntry = null;
        this.clearEditor();
    }

    clearEditor() {
        document.getElementById('content-editor').value = '';
        document.getElementById('tags-input').value = '';
        this.currentEntry = null;
    }

    renderEntries(entries = this.data.entries) {
        const list = document.getElementById('entries-list');
        list.innerHTML = entries.map(entry => `
            <div class="entry-item" onclick="kb.editEntry('${entry.id}')">
                <div>${entry.content.substring(0, 50)}...</div>
                <div class="tags">
                    ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    editEntry(id) {
        this.currentEntry = this.data.entries.find(e => e.id === id);
        document.getElementById('content-editor').value = this.currentEntry.content;
        document.getElementById('tags-input').value = this.currentEntry.tags.join(', ');
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.svg
            .attr("width", this.width)
            .attr("height", this.height);
        
        this.simulation
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("bounds", () => {
                const nodes = this.simulation.nodes();
                for (let node of nodes) {
                    node.x = Math.max(this.nodeRadius + this.padding, 
                                    Math.min(this.width - this.nodeRadius - this.padding, node.x));
                    node.y = Math.max(this.nodeRadius + this.padding, 
                                    Math.min(this.height - this.nodeRadius - this.padding, node.y));
                }
            });
        this.simulation.alpha(1).restart();
    }

    exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 20;

        doc.setFontSize(16);
        doc.text('Knowledge Base Export', 20, y);
        y += 20;

        this.data.entries.forEach(entry => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(12);
            doc.text(entry.content.substring(0, 50), 20, y);
            y += 10;
            
            doc.setFontSize(10);
            doc.text(`Tags: ${entry.tags.join(', ')}`, 20, y);
            y += 20;
        });

        doc.save('knowledge-base-export.pdf');
    }
}
