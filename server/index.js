
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const multer = require('multer');
const path = require('path');
const archiver = require('archiver');
const unzipper = require('unzipper');


const app = express();
app.use(cors());
app.use(express.json());

// File upload setup
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const PORT = process.env.PORT || 5000;


app.get('/', (req, res) => {
  res.send('Project Management API is running');
});

// File upload endpoint
app.post('/api/upload', upload.array('files'), (req, res) => {
  const files = req.files.map(f => ({ filename: f.filename, originalname: f.originalname, path: f.path }));
  res.json({ success: true, files });
});


// Save project as zip
app.post('/api/save-zip', async (req, res) => {
  // Expects JSON body: { projectData, images: [filename, ...] }
  try {
    const { projectData, images } = req.body;
    const archiveName = `project-${Date.now()}.zip`;
    const archivePath = path.join(uploadDir, archiveName);
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      res.download(archivePath, archiveName, () => {
        fs.unlinkSync(archivePath);
      });
    });
    archive.on('error', err => res.status(500).json({ error: err.message }));

    archive.pipe(output);
    archive.append(JSON.stringify(projectData), { name: 'project.json' });
    if (Array.isArray(images)) {
      for (const img of images) {
        const imgPath = path.join(uploadDir, img);
        if (fs.existsSync(imgPath)) {
          archive.file(imgPath, { name: `images/${img}` });
        }
      }
    }
    await archive.finalize();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Open project from zip
app.post('/api/open-zip', upload.single('zipfile'), async (req, res) => {
  try {
    const zipPath = req.file.path;
    const directory = await unzipper.Open.file(zipPath);
    const projectJson = directory.files.find(f => f.path === 'project.json');
    let projectData = null;
    if (projectJson) {
      const content = await projectJson.buffer();
      projectData = JSON.parse(content.toString());
    }
    // Extract images to uploads dir
    const images = [];
    for (const file of directory.files) {
      if (file.path.startsWith('images/')) {
        const imgName = file.path.replace('images/', '');
        const imgPath = path.join(uploadDir, imgName);
        fs.writeFileSync(imgPath, await file.buffer());
        images.push(imgName);
      }
    }
    fs.unlinkSync(zipPath);
    res.json({ projectData, images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
