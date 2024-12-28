import {
  computed,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';

export interface TimelineVideo {
  name: string;
  duration: number;
  preview: string;
  url: string;
  frames: string[];
}

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  timelineList: WritableSignal<TimelineVideo[]> = signal([]);
  totalDuration: WritableSignal<number> = signal(30);

  timeLineStart: WritableSignal<number> = signal(0);
  timeLineEnd = computed(() => this.totalDuration());

  constructor() {}

  public async generateFramesForVideo(newFile: TimelineVideo): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const videoEl = document.createElement('video');
      videoEl.src = newFile.url;
      videoEl.muted = true;
      videoEl.autoplay = false;
      videoEl.playsInline = true;

      videoEl.addEventListener('loadedmetadata', async () => {
        const totalSec = Math.floor(videoEl.duration);
        try {
          for (let s = 0; s < totalSec; s++) {
            await this.captureFrameAtSecond(videoEl, s, newFile.frames);
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      videoEl.addEventListener('error', () => {
        reject(new Error('Video loading error'));
      });
    });
  }

  public captureFrameAtSecond(
    videoEl: HTMLVideoElement,
    second: number,
    frames: string[]
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      videoEl.currentTime = second;

      const onSeeked = () => {
        videoEl.removeEventListener('seeked', onSeeked);

        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context is null'));
          return;
        }

        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');

        frames.push(dataUrl);
        resolve();
      };

      videoEl.addEventListener('seeked', onSeeked);
    });
  }

  public recalculateTotalDuration(): void {
    const total = this.timelineList().reduce(
      (acc, clip) => acc + clip.duration,
      0
    );
    this.totalDuration.set(total);
    console.log(this.totalDuration());
  }

  public async createFilesFromTimeline(): Promise<File[]> {
    const files: File[] = [];
    const timeline = this.timelineList();

    for (const video of timeline) {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const file = new File([blob], video.name, { type: blob.type });
      files.push(file);
    }

    return files;
  }
}
