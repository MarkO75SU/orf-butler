import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const app = express();
app.use(express.static(PUBLIC_DIR));

app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'landing.html')));
app.get('/landing', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'landing.html')));
app.get('/app', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'app.html')));
app.get('/license', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'license.html')));
app.get('/imprint', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'imprint.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'privacy.html')));

app.listen(3000, () => {
    console.log('Server: http://localhost:3000');
});
