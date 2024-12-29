import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const clearProcessedVideos = (directory: string): void => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
    return;
  }

  const files = fs.readdirSync(directory);
  files.forEach((file) => {
    const filePath = path.join(directory, file);
    fs.unlinkSync(filePath);
  });
};

export const generateConcatFile = (
  videos: Express.Multer.File[],
  tempDir: string
): string => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const concatFile = path.join(tempDir, `concat_${uuidv4()}.txt`);
  const fileList = videos
    .map((file) => `file '${path.resolve(file.path)}'`)
    .join('\n');
  fs.writeFileSync(concatFile, fileList);
  return concatFile;
};

export const deleteFiles = (filePaths: string[]): void => {
  filePaths.forEach((filePath) => {
    try {
      fs.unlinkSync(filePath);
      console.log('Deleted file:', filePath);
    } catch (error) {
      console.error('Failed to delete file:', filePath, error);
    }
  });
};
