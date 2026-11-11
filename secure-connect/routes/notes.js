const express = require('express');
const Note = require('../models/Note');
const appEvents = require('../events');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(verifyToken);

// CREATE: POST /api/notes
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const note = await Note.create({ title, content, owner: req.user.id });
    appEvents.emit('note:created', note);
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// READ ALL: GET /api/notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user.id });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// READ ONE: GET /api/notes/:id
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
  } catch (err) {
    res.status(400).json({ message: 'Invalid note id' });
  }
});

// UPDATE: PUT /api/notes/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { title, content },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
  } catch (err) {
    res.status(400).json({ message: 'Invalid request' });
  }
});

// DELETE: DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    appEvents.emit('note:deleted', note);
    res.status(200).json({ message: 'Note deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid note id' });
  }
});

module.exports = router;