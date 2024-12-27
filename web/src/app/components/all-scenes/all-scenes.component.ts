import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-scenes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-scenes.component.html',
  styleUrls: ['./all-scenes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllScenesComponent {
  @Output() playEvent = new EventEmitter<string>();
  videos: Array<{
    name: string;
    url: string;
    preview: string;
    duration: string;
  }> = [];

  constructor(private cdr: ChangeDetectorRef) {}

  onFileSelected(event: any) {
    const files = event.target.files;
    for (const file of files) {
      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        const url = e.target.result;

        this.extractVideoDetails(url).then(({ preview, duration }) => {
          this.videos.push({
            name: file.name,
            url,
            preview,
            duration,
          });
          this.cdr.markForCheck();
        });
      };
      fileReader.readAsDataURL(file);
    }
  }

  async extractVideoDetails(
    videoUrl: string
  ): Promise<{ preview: string; duration: string }> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;
      video.currentTime = 2;

      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const duration = this.formatDuration(video.duration);
        resolve({
          preview: canvas.toDataURL('image/jpeg'),
          duration,
        });
      });
    });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  removeVideo(index: number) {
    this.videos.splice(index, 1);
    this.cdr.markForCheck();
  }

  playVideo(url: string) {
    this.playEvent.emit(url);
  }
}
