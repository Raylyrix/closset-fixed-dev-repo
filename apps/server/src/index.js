import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createWriteStream } from 'fs';
import { mkdir, readFile, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch, { FormData, Blob } from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const STORAGE_DIR = path.join(__dirname, '..', '..', '..', 'storage');
const MODELS_DIR = path.join(STORAGE_DIR, 'models');
const BACKGROUNDS_DIR = path.join(STORAGE_DIR, 'backgrounds');

async function ensureStorage() {
  console.log('Ensuring storage directories exist...');
  console.log('STORAGE_DIR:', STORAGE_DIR);
  console.log('MODELS_DIR:', MODELS_DIR);
  console.log('BACKGROUNDS_DIR:', BACKGROUNDS_DIR);
  
  try {
    await mkdir(STORAGE_DIR, { recursive: true });
    console.log('STORAGE_DIR created/verified');
    
    await mkdir(MODELS_DIR, { recursive: true });
    console.log('MODELS_DIR created/verified');
    
    await mkdir(BACKGROUNDS_DIR, { recursive: true });
    console.log('BACKGROUNDS_DIR created/verified');
  } catch (error) {
    console.error('Error creating storage directories:', error);
    throw error;
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ 
    message: 'Backend is working',
    storageDir: STORAGE_DIR,
    modelsDir: MODELS_DIR,
    backgroundsDir: BACKGROUNDS_DIR
  });
});

// Removed old upload endpoint - now using /api/models/upload

app.post('/api/save', async (req, res) => {
  try {
    await ensureStorage();
    const { project } = req.body;
    if (!project) return res.status(400).json({ error: 'Missing project' });
    const id = uuidv4();
    const fp = path.join(STORAGE_DIR, `${id}.json`);
    await writeFile(fp, JSON.stringify(project));
    res.json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Save failed' });
  }
});

// OpenRouter proxy - avoids exposing API key to clients
// POST /api/ai/chat-openrouter
// Body: { messages: [{role, content}], model?: string, temperature?: number, max_tokens?: number }
app.post('/api/ai/chat-openrouter', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY on server' });

    const {
      messages = [],
      model = 'openrouter/sonoma-sky-alpha',
      temperature = 0.7,
      max_tokens = 1024,
      top_p,
      frequency_penalty,
      presence_penalty
    } = req.body || {};

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Optional but recommended headers
        'HTTP-Referer': req.headers['origin'] || 'http://localhost:5173',
        'X-Title': 'Closset Studio'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        top_p,
        frequency_penalty,
        presence_penalty
      })
    });

    const json = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: 'OpenRouter error', detail: json });
    }
    res.json(json);
  } catch (e) {
    console.error('OpenRouter proxy error:', e);
    res.status(500).json({ error: 'OpenRouter proxy failed' });
  }
});

// Background management endpoints
app.get('/api/backgrounds', async (req, res) => {
  try {
    await ensureStorage();
    const metadataPath = path.join(BACKGROUNDS_DIR, 'metadata.json');
    try {
      const metadata = await readFile(metadataPath, 'utf8');
      res.json(JSON.parse(metadata));
    } catch (e) {
      res.json([]);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch backgrounds' });
  }
});

app.post('/api/backgrounds/upload', upload.single('background'), async (req, res) => {
  try {
    await ensureStorage();
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    const id = uuidv4();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.hdr', '.exr'];
    
    if (!allowedTypes.includes(ext)) {
      return res.status(400).json({ error: 'Unsupported file type. Use JPG, PNG, HDR, or EXR.' });
    }
    
    const filename = `${id}${ext}`;
    const filePath = path.join(BACKGROUNDS_DIR, filename);
    await writeFile(filePath, req.file.buffer);
    
    // Create metadata
    const metadataPath = path.join(BACKGROUNDS_DIR, 'metadata.json');
    let backgrounds = [];
    try {
      const existingMetadata = await readFile(metadataPath, 'utf8');
      backgrounds = JSON.parse(existingMetadata);
    } catch (e) {
      // No existing metadata
    }
    
    const newBackground = {
      id,
      name: req.file.originalname.replace(ext, ''),
      type: 'custom',
      url: `/api/backgrounds/${id}/file`,
      description: `Custom background: ${req.file.originalname}`,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      fileExtension: ext // Store the file extension for proper file serving
    };
    
    backgrounds.push(newBackground);
    await writeFile(metadataPath, JSON.stringify(backgrounds, null, 2));
    
    res.json(newBackground);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/backgrounds/:id/file', async (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(BACKGROUNDS_DIR, 'metadata.json');
    
    let backgrounds = [];
    try {
      const metadata = await readFile(metadataPath, 'utf8');
      backgrounds = JSON.parse(metadata);
    } catch (e) {
      return res.status(404).json({ error: 'Background not found' });
    }
    
    const background = backgrounds.find(b => b.id === id);
    if (!background) {
      return res.status(404).json({ error: 'Background not found' });
    }
    
    const filePath = path.join(BACKGROUNDS_DIR, `${id}${background.fileExtension}`);
    res.sendFile(filePath);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to serve background' });
  }
});

app.delete('/api/backgrounds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(BACKGROUNDS_DIR, 'metadata.json');
    
    let backgrounds = [];
    try {
      const metadata = await readFile(metadataPath, 'utf8');
      backgrounds = JSON.parse(metadata);
    } catch (e) {
      return res.status(404).json({ error: 'Background not found' });
    }
    
    const backgroundIndex = backgrounds.findIndex(b => b.id === id);
    if (backgroundIndex === -1) {
      return res.status(404).json({ error: 'Background not found' });
    }
    
    const background = backgrounds[backgroundIndex];
    if (background.type === 'default') {
      return res.status(400).json({ error: 'Cannot delete default backgrounds' });
    }
    
    // Remove from metadata
    backgrounds.splice(backgroundIndex, 1);
    await writeFile(metadataPath, JSON.stringify(backgrounds, null, 2));
    
    // Delete file
    const filePath = path.join(BACKGROUNDS_DIR, `${id}${background.fileExtension}`);
    try {
      await unlink(filePath);
    } catch (e) {
      console.log('File already deleted or not found');
    }
    
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.post('/api/upscale', upload.single('image'), async (req, res) => {
  try {
    const aiUrl = process.env.AI_URL || 'http://127.0.0.1:8000';
    if (!req.file) return res.status(400).json({ error: 'No image' });
    const form = new FormData();
    form.append('image', new Blob([req.file.buffer]), req.file.originalname || 'image.png');
    const r = await fetch(`${aiUrl}/upscale?scale=2`, { method: 'POST', body: form });
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'AI service failed', detail: text });
    }
    res.set('Content-Type', r.headers.get('content-type') || 'image/png');
    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Upscale failed' });
  }
});

// Model management endpoints
app.get('/api/models', async (req, res) => {
  try {
    await ensureStorage();
    const metadataPath = path.join(MODELS_DIR, 'metadata.json');
    try {
      const metadata = await readFile(metadataPath, 'utf8');
      res.json(JSON.parse(metadata));
    } catch (e) {
      res.json([]);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

app.post('/api/models/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received:', req.file?.originalname);
    
    await ensureStorage();
    console.log('Storage ensured, MODELS_DIR:', MODELS_DIR);
    
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    const id = uuidv4();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedTypes = ['.glb', '.gltf', '.obj', '.fbx', '.dae', '.ply'];
    
    console.log('File extension:', ext, 'Allowed types:', allowedTypes);
    
    if (!allowedTypes.includes(ext)) {
      return res.status(400).json({ error: 'Unsupported file type. Use GLB, GLTF, OBJ, FBX, DAE, or PLY.' });
    }
    
    const filename = `${id}${ext}`;
    const filePath = path.join(MODELS_DIR, filename);
    console.log('Saving file to:', filePath);
    
    await writeFile(filePath, req.file.buffer);
    console.log('File saved successfully');
    
    // Create metadata
    const metadataPath = path.join(MODELS_DIR, 'metadata.json');
    let models = [];
    try {
      const existingMetadata = await readFile(metadataPath, 'utf8');
      models = JSON.parse(existingMetadata);
      console.log('Loaded existing metadata, models count:', models.length);
    } catch (e) {
      console.log('No existing metadata, starting with empty array');
      // No existing metadata, start with empty array
    }
    
    const newModel = {
      id,
      name: req.file.originalname,
      filename,
      fileExtension: ext,
      uploadedAt: new Date().toISOString(),
      type: 'custom'
    };
    
    models.push(newModel);
    console.log('Added new model to array, total models:', models.length);
    
    await writeFile(metadataPath, JSON.stringify(models, null, 2));
    console.log('Metadata saved successfully');
    
    res.json(newModel);
  } catch (e) {
    console.error('Upload error details:', e);
    console.error('Error stack:', e.stack);
    res.status(500).json({ error: 'Upload failed', details: e.message });
  }
});

app.get('/api/models/:id/file', async (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(MODELS_DIR, 'metadata.json');
    
    let models = [];
    try {
      const metadata = await readFile(metadataPath, 'utf8');
      models = JSON.parse(metadata);
    } catch (e) {
      return res.status(404).json({ error: 'Models not found' });
    }
    
    const model = models.find(m => m.id === id);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    const filePath = path.join(MODELS_DIR, `${id}${model.fileExtension}`);
    res.sendFile(filePath);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to serve model' });
  }
});

app.delete('/api/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(MODELS_DIR, 'metadata.json');
    
    let models = [];
    try {
      const metadata = await readFile(metadataPath, 'utf8');
      models = JSON.parse(metadata);
    } catch (e) {
      return res.status(404).json({ error: 'Models not found' });
    }
    
    const modelIndex = models.findIndex(m => m.id === id);
    if (modelIndex === -1) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    const model = models[modelIndex];
    
    // Remove from metadata
    models.splice(modelIndex, 1);
    await writeFile(metadataPath, JSON.stringify(models, null, 2));
    
    // Delete file
    const filePath = path.join(MODELS_DIR, `${id}${model.fileExtension}`);
    try {
      await unlink(filePath);
    } catch (e) {
      console.log('File already deleted or not found');
    }
    
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.use('/storage', express.static(STORAGE_DIR, { maxAge: '1y' }));

const PORT = process.env.PORT || 4000;

// Enhanced error handling for server startup
const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log('Testing storage directories...');
  
  // Test storage on startup
  ensureStorage()
    .then(() => console.log('✅ Storage directories verified on startup'))
    .catch(err => console.error('❌ Storage error on startup:', err));
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error('Port 4000 is already in use. Kill existing processes and restart.');
  }
});


