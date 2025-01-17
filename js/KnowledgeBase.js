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
        this.svg = d3.select("#canvas");
        this.g = this.svg.append("g");

        // Configurar fuerzas de simulación
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collision", d3.forceCollide().radius(this.nodeRadius * 1.5));

        // Zoom
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                this.g.attr("transform", event.transform);
            });

        this.svg.call(zoom);
    }

    async loadData() {
        try {
            const response = await fetch('data/entries.json');
            this.data = await response.json();
            this.updateGraph();
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = { entries: [] };
        }
    }

    updateGraph() {
        const nodes = this.data.entries;
        const links = this.generateLinks(nodes);
        
        this.drawLinks(links);
        this.drawNodes(nodes);
        this.setupSimulation(nodes, links);
    }

    generateLinks(nodes) {
        const links = [];
        const nodeMap = new Map(nodes.map(node => [node.id, node]));

        nodes.forEach(source => {
            nodes.forEach(target => {
                if (source.id !== target.id) {
                    // Crear enlaces basados en tags comunes
                    const commonTags = source.tags.filter(tag => target.tags.includes(tag));
                    if (commonTags.length > 0) {
                        links.push({ source: source.id, target: target.id, value: commonTags.length });
                    }
                }
            });
        });

        return links;
    }

    drawLinks(links) {
        this.g.selectAll(".link").remove();
        
        this.g.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("class", "link")
            .attr("stroke-width", d => Math.sqrt(d.value));
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

        // Eventos de tooltip
        const showTooltip = (event, d) => {
            d3.selectAll(".tooltip").remove();
            
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("left", `${event.clientX}px`)
                .style("top", `${event.clientY}px`);
            
            tooltip.html(`
                <div>${d.content.substring(0, 50)}...</div>
                ${d.tags.length ? `<div class="tags">${d.tags.join(", ")}</div>` : ""}
            `);
            
            requestAnimationFrame(() => tooltip.classed("visible", true));
        };

        const moveTooltip = (event) => {
            d3.select(".tooltip")
                .style("left", `${event.clientX}px`)
                .style("top", `${event.clientY}px`);
        };

        const hideTooltip = () => {
            const tooltip = d3.select(".tooltip");
            tooltip.classed("visible", false);
            setTimeout(() => tooltip.remove(), 200);
        };

        node.on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseout", hideTooltip);

        // Evento de clic
        node.on("click", (event, d) => {
            event.stopPropagation();
            this.handleNodeClick(d);
        });

        return node;
    }

    handleNodeClick(d) {
        this.currentEntry = d;
        
        // Actualizar panel de edición
        document.getElementById('content-editor').value = d.content;
        document.getElementById('tags-input').value = d.tags.join(', ');
        
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
    }

    setupSimulation(nodes, links) {
        if (this.simulation) this.simulation.stop();

        this.simulation
            .nodes(nodes)
            .force("link").links(links);

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

    newEntry() {
        // Limpiar entrada actual
        this.currentEntry = null;
        
        // Limpiar formulario
        document.getElementById('content-editor').value = '';
        document.getElementById('tags-input').value = '';
        
        // Limpiar panel de detalles
        document.getElementById('entry-details').innerHTML = '';
        
        // Mostrar el panel de edición
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.add('open');
        document.getElementById('toggle-sidebar').classList.add('active');
        
        // Enfocar el editor
        document.getElementById('content-editor').focus();
    }

    clearEditor() {
        document.getElementById('content-editor').value = '';
        document.getElementById('tags-input').value = '';
        this.currentEntry = null;
        
        // Limpiar panel de detalles
        document.getElementById('entry-details').innerHTML = '';
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
        
        // Actualizar el gráfico
        this.updateGraph();
        
        // Mostrar mensaje de confirmación
        const entryDetails = document.getElementById('entry-details');
        entryDetails.innerHTML = `
            <div class="entry-item success">
                <div class="entry-content">Entry saved successfully!</div>
            </div>
        `;
        
        // Limpiar mensaje después de 2 segundos
        setTimeout(() => {
            if (!this.currentEntry) {
                entryDetails.innerHTML = '';
            }
        }, 2000);
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
