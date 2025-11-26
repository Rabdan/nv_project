const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dbRoutes = require('./routes/db');
const uploadsRoutes = require('./routes/uploads');
const authMiddleware = require('./middleware/auth');
const requireApiKey = require('./middleware/requireApiKey');
const n8nService = require('./services/n8n');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
const uploadsPath = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/nvision')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', requireApiKey, authRoutes); // Auth routes (API Key required)
app.use('/api', authMiddleware, dbRoutes); // Protected DB routes (API Key OR JWT)
app.use('/api/uploads', authMiddleware, uploadsRoutes); // Uploads (API Key OR JWT)

// n8n Sync Endpoint (Protected by API Key)
app.post('/api/n8n/sync', requireApiKey, async (req, res) => {
    try {
        await n8nService.syncCredentials();
        await n8nService.syncWorkflows();
        res.json({ message: 'n8n sync completed successfully' });
    } catch (error) {
        console.error('n8n sync failed:', error);
        res.status(500).json({ error: 'n8n sync failed', details: error.message });
    }
});

// n8n Export Endpoint (Protected by API Key)
app.post('/api/n8n/export', requireApiKey, async (req, res) => {
    try {
        const zipPath = await n8nService.exportN8nData();
        res.json({
            message: 'n8n data exported successfully',
            downloadUrl: `/uploads/n8n-data.zip`
        });
    } catch (error) {
        console.error('n8n export failed:', error);
        res.status(500).json({ error: 'n8n export failed', details: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Sync n8n Workflows & Credentials on startup
    try {
        await n8nService.exportN8nData();
    } catch (error) {
        console.error('Failed to sync n8n workflows or credentials:', error.message);
    }
});
