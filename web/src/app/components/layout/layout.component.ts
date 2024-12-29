import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllScenesComponent } from '../all-scenes/all-scenes.component';
import { PreviewComponent } from '../preview/preview.component';
import { TimelineComponent } from '../timeline/timeline.component';
import { VideoService } from '../../services/video.service';
import { ApiService } from '../../services/api.service';
import { ToasterService } from '../../services/toaster.service';
import { LoaderService } from '../../services/loader.service';

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
    private videoService: VideoService,
    private toasterService: ToasterService,
    private loaderService: LoaderService
  ) {}

  onPlayVideo(url: string) {
    this.selectedVideoUrl = url;
    this.toasterService.showToast('success', 'Video is now playing!');
  }

  async renderVideo() {
    try {
      this.toasterService.showToast(
        'warning',
        'Rendering video, please wait...'
      );
      this.loaderService.showLoader();
      const files: File[] = await this.videoService.createFilesFromTimeline();

      const formData = new FormData();
      files.forEach((file) => formData.append('videos', file));
      formData.append('start', this.videoService.timeLineStart().toString());
      formData.append('end', this.videoService.timeLineEnd().toString());

      this.apiService.processVideos(formData).subscribe({
        next: (response: { id: string }) => {
          this.apiService.getVideoById(response.id).subscribe({
            next: (videoBlob: Blob) => {
              const videoUrl = URL.createObjectURL(videoBlob);
              this.selectedVideoUrl = videoUrl;
              this.toasterService.showToast(
                'success',
                'Video rendering completed!'
              );
              this.loaderService.hideLoader();
            },
            error: () => {
              this.toasterService.showToast('error', 'Failed to fetch video!');
              this.loaderService.hideLoader();
            },
          });
        },
        error: () => {
          this.toasterService.showToast(
            'error',
            'Failed to upload video for processing!'
          );
          this.loaderService.hideLoader();
        },
      });
    } catch (error) {
      this.toasterService.showToast('error', 'Error during video rendering!');
      this.loaderService.hideLoader();
    }
  }

  public async export() {
    if (this.selectedVideoUrl) {
      try {
        this.loaderService.showLoader();
        this.toasterService.showToast(
          'warning',
          'Exporting video, please wait...'
        );

        // Simulating async export operation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const anchor = document.createElement('a');
        anchor.href = this.selectedVideoUrl;
        anchor.download = 'exported_video.mp4';

        document.body.appendChild(anchor);
        anchor.click();

        document.body.removeChild(anchor);

        this.toasterService.showToast(
          'success',
          'Video exported successfully!'
        );
      } catch (error) {
        this.toasterService.showToast('error', 'Error exporting the video!');
      } finally {
        this.loaderService.hideLoader();
      }
    } else {
      this.toasterService.showToast('warning', 'No video available to export!');
    }
  }
}
