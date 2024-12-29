import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ToasterService } from '../../services/toaster.service';
import { LoaderService } from '../../services/loader.service';

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

  constructor(
    private cdr: ChangeDetectorRef,
    private toasterService: ToasterService,
    private loaderService: LoaderService
  ) {}

  async onFileSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      this.toasterService.showToast('error', 'No files selected!');
      return;
    }

    this.loaderService.showLoader();

    try {
      for (const file of files) {
        if (!file.type.startsWith('video/')) {
          this.toasterService.showToast(
            'error',
            `Invalid file type: ${file.name}. Only video files are supported.`
          );
          continue;
        }

        const fileReader = new FileReader();
        const url = await new Promise<string>((resolve, reject) => {
          fileReader.onload = (e: any) => resolve(e.target.result);
          fileReader.onerror = () =>
            reject(new Error(`Failed to read file: ${file.name}`));
          fileReader.readAsDataURL(file);
        });

        const { preview, duration } = await this.extractVideoDetails(url);
        this.videos.push({
          name: file.name,
          url,
          preview,
          duration,
        });

        this.toasterService.showToast(
          'success',
          `Video "${file.name}" added successfully!`
        );
        this.cdr.markForCheck();
      }
    } catch (err: any) {
      this.toasterService.showToast('error', err.message);
    } finally {
      this.loaderService.hideLoader();
    }
  }

  async extractVideoDetails(
    videoUrl: string
  ): Promise<{ preview: string; duration: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;
      video.currentTime = 2;

      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to initialize canvas context.'));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const duration = Math.round(video.duration);
        resolve({
          preview: canvas.toDataURL('image/jpeg'),
          duration,
        });
      });

      video.onerror = () => {
        reject(new Error('Error loading video metadata.'));
      };
    });
  }

  playVideo(url: string) {
    this.playEvent.emit(url);
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.videos, event.previousIndex, event.currentIndex);
      this.toasterService.showToast('success', 'Video order updated.');
      return;
    }
  }

  removeVideo(index: number) {
    const removedVideo = this.videos[index];
    this.videos.splice(index, 1);
    this.toasterService.showToast(
      'success',
      `Video "${removedVideo.name}" has been removed!`
    );
    this.cdr.markForCheck();
  }
}
