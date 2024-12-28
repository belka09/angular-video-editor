import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

interface TimelineVideo {
  name: string;
  duration: number;
  preview: string;
  url: string;
  frames: string[];
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  timelineList: TimelineVideo[] = [];

  totalDuration = 30;

  constructor(private cdr: ChangeDetectorRef) {}

  createArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  async onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        this.timelineList,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const file = event.previousContainer.data[event.previousIndex];

      const newFile: TimelineVideo = {
        ...file,
        frames: [],
      };

      await this.generateFramesForVideo(newFile);

      this.timelineList.push(newFile);
    }

    this.recalculateTotalDuration();
    this.cdr.markForCheck();
  }

  private recalculateTotalDuration() {
    this.totalDuration = this.timelineList.reduce(
      (acc, clip) => acc + clip.duration,
      0
    );
  }

  private async generateFramesForVideo(newFile: TimelineVideo): Promise<void> {
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

  private captureFrameAtSecond(
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
}
