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

  constructor(private videoService: VideoService) {
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
        videoElement
          .play()
          .catch((err) => console.error('Autoplay failed:', err));
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
      console.log(`Video playback moved to second: ${clampedSecond}`);
    }
  }
}
