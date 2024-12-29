import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const upload = multer({ dest: 'uploads/' });

const tempDir = path.join(__dirname, 'temp');
const processedVideosDir = path.join(__dirname, 'processedVideos');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

if (!fs.existsSync(processedVideosDir)) {
  fs.mkdirSync(processedVideosDir);
}

const videoStore: { [key: string]: string } = {};

const execPromise = (command: string): Promise<void> =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('FFmpeg Error:', stderr);
        reject(new Error(`FFmpeg command failed: ${command}\n${stderr}`));
      } else {
        resolve();
      }
    });
  });

const clearProcessedVideos = () => {
  try {
    const files = fs.readdirSync(processedVideosDir);
    files.forEach((file) => {
      const filePath = path.join(processedVideosDir, file);
      fs.unlinkSync(filePath);
    });
    console.log('Processed videos folder cleared.');
  } catch (error) {
    console.error('Failed to clear processed videos folder:', error);
  }
};

app.post('/process', upload.array('videos'), async (req, res) => {
  try {
    clearProcessedVideos();

    const { start, end } = req.body;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No videos uploaded' });
      return;
    }

    const videos = req.files as Express.Multer.File[];
    const concatFile = path.join(tempDir, `concat_${uuidv4()}.txt`);

    const fileList = videos
      .map((file) => `file '${path.resolve(file.path)}'`)
      .join('\n');

    console.log('Generated concat file content:\n', fileList); // Debug log
    fs.writeFileSync(concatFile, fileList);

    const outputFile = path.join(processedVideosDir, `${uuidv4()}.mp4`);
    const tempFile = path.join(processedVideosDir, `temp_${uuidv4()}.mp4`);

    await execPromise(
      `ffmpeg -f concat -safe 0 -i ${concatFile} -c copy ${tempFile}`
    );

    await execPromise(
      `ffmpeg -i ${tempFile} -ss ${start} -to ${end} -c copy ${outputFile}`
    );

    fs.unlinkSync(concatFile);
    fs.unlinkSync(tempFile);
    videos.forEach((file) => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Failed to delete file ${file.path}:`, err);
      }
    });

    console.log('Temporary files successfully deleted.');

    const id = uuidv4();
    videoStore[id] = outputFile;

    res.json({ id });
  } catch (error) {
    console.error('Error processing videos:', error);

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error(
            `Failed to delete file ${file.path} during error handling:`,
            err
          );
        }
      });
    }

    res.status(500).json({ error: 'Error processing videos' });
  }
});

app.get('/video/:id', (req, res) => {
  const { id } = req.params;

  const filePath = videoStore[id];
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
