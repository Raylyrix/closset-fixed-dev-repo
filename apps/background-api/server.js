// Minimal Background API stub
// Run: node server.js (requires: npm i express cors multer)

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ensure uploads dir exists (legacy backgrounds bucket)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safe = file.originalname.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({ storage });

// Model uploads use memory storage so we can manage paths ourselves
const modelUpload = multer({ storage: multer.memoryStorage() });

// Storage layout mirrors apps/server expectations
const storageRoot = path.join(__dirname, '..', '..', 'storage');
const modelsDir = path.join(storageRoot, 'models');
const backgroundsDir = path.join(storageRoot, 'backgrounds');
const modelMetadataPath = path.join(modelsDir, 'metadata.json');
const backgroundMetadataPath = path.join(backgroundsDir, 'metadata.json');

async function ensureDirectories() {
  await fsp.mkdir(storageRoot, { recursive: true }).catch(() => {});
  await fsp.mkdir(modelsDir, { recursive: true }).catch(() => {});
  await fsp.mkdir(backgroundsDir, { recursive: true }).catch(() => {});
}

// In-memory store of custom backgrounds (legacy behaviour)
let scenes = [];

// GET /api/backgrounds
app.get('/api/backgrounds', (req, res) => {
  res.json(scenes);
});

// POST /api/backgrounds/upload
app.post('/api/backgrounds/upload', upload.single('background'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const id = `bg_${Math.random().toString(36).slice(2, 8)}`;
  const scene = {
    id,
    name: req.file.originalname,
    type: 'custom',
    url: `/uploads/${req.file.filename}`,
    thumbnail: undefined,
    description: 'User uploaded background'
  };
  scenes.push(scene);
  res.json(scene);
});

// DELETE /api/backgrounds/:id
app.delete('/api/backgrounds/:id', (req, res) => {
  const { id } = req.params;
  scenes = scenes.filter(s => s.id !== id);
  res.status(204).end();
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Serve persistent storage (models/backgrounds)
app.use('/storage', express.static(storageRoot));

// --- Model endpoints ------------------------------------------------------

app.get('/api/models', async (req, res) => {
  try {
    await ensureDirectories();
    const raw = await fsp.readFile(modelMetadataPath, 'utf8').catch(() => '[]');
    res.json(JSON.parse(raw));
  } catch (error) {
    console.error('Failed to read model metadata:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

app.post('/api/models/upload', modelUpload.single('file'), async (req, res) => {
  try {
    await ensureDirectories();
    if (!req.file) {
      return res.status(400).json({ error: 'No file' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowed = ['.glb', '.gltf', '.obj', '.fbx', '.dae', '.ply'];
    if (!allowed.includes(ext)) {
      return res.status(400).json({ error: 'Unsupported file type. Use GLB, GLTF, OBJ, FBX, DAE, or PLY.' });
    }

    const id = randomUUID();
    const filename = `${id}${ext}`;
    const target = path.join(modelsDir, filename);
    await fsp.writeFile(target, req.file.buffer);

    let models = [];
    try {
      const existing = await fsp.readFile(modelMetadataPath, 'utf8');
      models = JSON.parse(existing);
    } catch (_) {
      // ignore - start fresh
    }

    const model = {
      id,
      name: req.file.originalname,
      filename,
      fileExtension: ext,
      uploadedAt: new Date().toISOString(),
      type: 'custom'
    };

    models.push(model);
    await fsp.writeFile(modelMetadataPath, JSON.stringify(models, null, 2));

    res.json(model);
  } catch (error) {
    console.error('Model upload failed:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/models/:id/file', async (req, res) => {
  try {
    await ensureDirectories();
    const raw = await fsp.readFile(modelMetadataPath, 'utf8').catch(() => '[]');
    const models = JSON.parse(raw);
    const model = models.find(m => m.id === req.params.id);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    const filePath = path.join(modelsDir, `${model.id}${model.fileExtension}`);
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Failed to serve model file:', error);
    res.status(500).json({ error: 'Failed to serve model' });
  }
});

app.delete('/api/models/:id', async (req, res) => {
  try {
    await ensureDirectories();
    const raw = await fsp.readFile(modelMetadataPath, 'utf8').catch(() => '[]');
    const models = JSON.parse(raw);
    const index = models.findIndex(m => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Model not found' });
    }

    const [removed] = models.splice(index, 1);
    await fsp.writeFile(modelMetadataPath, JSON.stringify(models, null, 2));

    const filePath = path.join(modelsDir, `${removed.id}${removed.fileExtension}`);
    await fsp.unlink(filePath).catch(() => {});

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete model:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Background API running on http://localhost:${PORT}`);
});
