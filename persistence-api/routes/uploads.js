const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Upload file from URL (for n8n DALL-E images)
router.post('/', async (req, res) => {
    try {
        const { image, filename } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image URL required' });
        }

        // Download image from URL
        const response = await axios.get(image, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // Save to uploads directory
        const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const finalFilename = filename || `${Date.now()}.png`;
        const filePath = path.join(uploadDir, finalFilename);
        fs.writeFileSync(filePath, buffer);

        res.json({
            success: true,
            path: `uploads/${finalFilename}`,
            url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/${finalFilename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload file directly (multipart/form-data)
router.post('/direct', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            success: true,
            path: `uploads/${req.file.filename}`,
            url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/${req.file.filename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
