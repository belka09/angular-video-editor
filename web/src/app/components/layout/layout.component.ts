import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllScenesComponent } from '../all-scenes/all-scenes.component';
import { PreviewComponent } from '../preview/preview.component';
import { TimelineComponent } from '../timeline/timeline.component';
import { VideoService } from '../../services/video.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    AllScenesComponent,
    PreviewComponent,
    TimelineComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  selectedVideoUrl: string | null = null;

  constructor(
    private apiService: ApiService,
    private videoService: VideoService
  ) {}

  onPlayVideo(url: string) {
    this.selectedVideoUrl = url;
  }

  async renderVideo() {
    try {
      const files: File[] = await this.videoService.createFilesFromTimeline();

      const formData = new FormData();
      files.forEach((file) => formData.append('videos', file));
      formData.append('start', this.videoService.timeLineStart().toString());
      formData.append('end', this.videoService.timeLineEnd().toString());

      this.apiService.processVideos(formData).subscribe({
        next: (response: { id: string }) => {
          console.log('Video processed successfully, ID:', response.id);

          this.apiService.getVideoById(response.id).subscribe({
            next: (videoBlob: Blob) => {
              const videoUrl = URL.createObjectURL(videoBlob);
              this.selectedVideoUrl = videoUrl;
            },
            error: (err) => {
              console.error('Error fetching video:', err);
            },
          });
        },
        error: (err) => {
          console.error('Upload error:', err);
        },
      });
    } catch (error) {
      console.error('Video error:', error);
    }
  }
}
