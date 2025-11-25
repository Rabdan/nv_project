const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { QdrantClient } = require('@qdrant/js-client-rest');

// Qdrant Client
const qdrant = new QdrantClient({ url: process.env.QDRANT_URL || 'http://qdrant:6333' });

// Helper to get or create a dynamic model
const getModel = (collectionName) => {
    if (mongoose.models[collectionName]) {
        return mongoose.models[collectionName];
    }
    // Strict: false allows saving any fields
    const schema = new mongoose.Schema({}, { strict: false, timestamps: true });
    return mongoose.model(collectionName, schema, collectionName);
};

// --- MongoDB Universal Routes ---

// GET /api/:collection - List with filter, sort, limit, skip
router.get('/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        const { filter = '{}', sort = '{}', limit = 100, skip = 0 } = req.query;

        const Model = getModel(collection);
        const query = JSON.parse(filter);
        const sortOptions = JSON.parse(sort);

        const items = await Model.find(query)
            .sort(sortOptions)
            .limit(Number(limit))
            .skip(Number(skip));

        const total = await Model.countDocuments(query);

        res.json({ items, total, limit: Number(limit), skip: Number(skip) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/:collection/:id - Get one
router.get('/:collection/:id', async (req, res) => {
    try {
        const { collection, id } = req.params;
        const Model = getModel(collection);
        const item = await Model.findById(id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/:collection - Create
router.post('/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        const Model = getModel(collection);
        const newItem = new Model(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/:collection/:id - Update
router.put('/:collection/:id', async (req, res) => {
    try {
        const { collection, id } = req.params;
        const Model = getModel(collection);
        const updatedItem = await Model.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ error: 'Not found' });
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/:collection/:id - Delete
router.delete('/:collection/:id', async (req, res) => {
    try {
        const { collection, id } = req.params;
        const Model = getModel(collection);
        await Model.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Qdrant Routes ---

// POST /api/qdrant/search - Search vectors
router.post('/qdrant/search', async (req, res) => {
    try {
        const { collection_name, vector, limit = 5, filter } = req.body;
        const result = await qdrant.search(collection_name, {
            vector,
            limit,
            filter
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/qdrant/upsert - Upsert points
router.post('/qdrant/upsert', async (req, res) => {
    try {
        const { collection_name, points } = req.body;
        const result = await qdrant.upsert(collection_name, {
            points
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
