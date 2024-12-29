import { exec } from 'child_process';

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

export default execPromise;
