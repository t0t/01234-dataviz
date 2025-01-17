const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// Middleware para servir archivos estáticos
app.use(express.static('.'));
app.use(express.json());

// Ruta para guardar datos
app.post('/save', async (req, res) => {
    try {
        const data = req.body;
        await fs.writeFile(
            path.join(__dirname, 'data', 'entries.json'),
            JSON.stringify(data, null, 2)
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Error saving data' });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
