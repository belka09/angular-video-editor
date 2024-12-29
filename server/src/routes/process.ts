import { Router } from 'express';
import multer from 'multer';
import {
  clearProcessedVideos,
  generateConcatFile,
  deleteFiles,
} from '../utils/fileManager';
import execPromise from '../utils/execPromise';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import videoStore from '../utils/store';

const router = Router();
const upload = multer({ dest: 'uploads/' });

const processedVideosDir = path.resolve(__dirname, '../processedVideos');
const tempDir = path.resolve(__dirname, '../temp');

router.post('/', upload.array('videos'), async (req, res) => {
  try {
    clearProcessedVideos(processedVideosDir);

    const { start, end } = req.body;
    const videos = req.files as Express.Multer.File[];
    const concatFile = generateConcatFile(videos, tempDir);
    const tempFile = path.join(processedVideosDir, `temp_${uuidv4()}.mp4`);
    const outputFile = path.join(processedVideosDir, `${uuidv4()}.mp4`);
    const uploadPaths = videos.map((file) => path.resolve(file.path));

    await execPromise(
      `ffmpeg -f concat -safe 0 -i ${concatFile} -c copy ${tempFile}`
    );

    await execPromise(
      `ffmpeg -i ${tempFile} -ss ${start} -to ${end} -c copy ${outputFile}`
    );

    deleteFiles([concatFile, tempFile, ...uploadPaths]);

    const id = uuidv4();
    videoStore[id] = outputFile;

    res.json({ id });
  } catch (error) {
    console.error('Error processing videos:', error);
    res.status(500).json({ error: 'Error processing videos' });
  }
});

export default router;
