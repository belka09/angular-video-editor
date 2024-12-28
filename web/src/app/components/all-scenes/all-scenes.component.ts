import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-all-scenes',
  standalone: true,
  imports: [CommonModule, DragDropModule],
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
    duration: number;
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
  ): Promise<{ preview: string; duration: number }> {
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

        const duration = Math.round(video.duration);
        resolve({
          preview: canvas.toDataURL('image/jpeg'),
          duration,
        });
      });
    });
  }

  playVideo(url: string) {
    this.playEvent.emit(url);
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.videos, event.previousIndex, event.currentIndex);
      return;
    }
  }

  removeVideo(index: number) {
    this.videos.splice(index, 1);
    this.cdr.markForCheck();
  }
}
