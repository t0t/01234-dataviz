import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para servir archivos estáticos
app.use(express.static(__dirname));

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Ruta para obtener datos
app.get('/data/entries.json', async (req, res) => {
    try {
        const data = await fs.readFile(
            join(__dirname, 'data', 'entries.json'),
            'utf8'
        );
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Error reading data' });
    }
});

// Ruta para guardar datos
app.post('/save', async (req, res) => {
    try {
        const data = req.body;
        await fs.writeFile(
            join(__dirname, 'data', 'entries.json'),
            JSON.stringify(data, null, 2)
        );
        console.log('Data saved successfully');
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Error saving data' });
    }
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Static files served from: ${__dirname}`);
});
