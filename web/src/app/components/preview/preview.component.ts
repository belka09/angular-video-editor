import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService } from '../../services/video.service';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewComponent implements OnChanges, AfterViewInit {
  @Input() videoUrl: string | null = null;

  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(
    private videoService: VideoService,
    private toasterService: ToasterService
  ) {
    effect(() => {
      const isPlaying = this.videoService.isVideoPlaying();
      isPlaying ? this.playVideo() : this.pauseVideo();
    });

    effect(() => {
      const currentSecond = this.videoService.cursorSecond();
      this.seekToSecond(currentSecond);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoUrl'] && this.videoUrl) {
      this.initializePlayback();
    }
  }

  ngAfterViewInit(): void {
    if (this.videoUrl) {
      this.initializePlayback();
    }
  }

  private initializePlayback(): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement) {
      videoElement.autoplay = true;
      videoElement.load();
      videoElement.onloadedmetadata = () => {
        this.seekToSecond(this.videoService.cursorSecond());
        this.toasterService.showToast('success', 'Video loaded successfully!');
      };
      videoElement.onerror = () => {
        this.toasterService.showToast(
          'error',
          'An error occurred while loading the video.'
        );
      };
    }
  }

  private seekToSecond(second: number): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement && !isNaN(videoElement.duration)) {
      const clampedSecond = Math.min(
        Math.max(second, 0),
        videoElement.duration
      );
      videoElement.currentTime = clampedSecond;
      this.toasterService.showToast(
        'warning',
        `Video playback moved to second: ${clampedSecond}`
      );
    }
  }

  private playVideo(): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement) {
      videoElement
        .play()
        .then(() => {
          this.toasterService.showToast('success', 'Video is now playing.');
        })
        .catch(() => {
          this.toasterService.showToast('error', 'Failed to play the video.');
        });
    }
  }

  private pauseVideo(): void {
    const videoElement = this.videoPlayer?.nativeElement;
    if (videoElement) {
      videoElement.pause();
      this.toasterService.showToast('success', 'Video playback paused.');
    }
  }
}
