import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import videoStore from '../utils/store';

const router = Router();

router.get('/:id', (req, res) => {
  const { id } = req.params;

  const filePath = videoStore[id];

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
    } else {
      console.log('File sent successfully:', filePath);
    }
  });
});

export default router;
