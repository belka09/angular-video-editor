import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  effect,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { VideoService } from '../../services/video.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  timelineList = computed(() => this.videoService.timelineList());
  totalDuration = computed(() => this.videoService.totalDuration());

  cursorPosition = 0;
  isDragging = false;
  timelineWidth = 0;

  constructor(
    private videoService: VideoService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      this.cdr.markForCheck();
    });
  }

  createArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  startDragging(event: MouseEvent): void {
    const timelineElement = document.getElementById('timeline');
    if (timelineElement) {
      this.timelineWidth = timelineElement.getBoundingClientRect().width;
      this.isDragging = true;
    }
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onDrag(event: MouseEvent): void {
    if (this.isDragging) {
      const timelineElement = document.getElementById('timeline');
      if (timelineElement) {
        const rect = timelineElement.getBoundingClientRect();
        this.cursorPosition = Math.max(
          0,
          Math.min(event.clientX - rect.left, rect.width)
        );

        const second = this.getCurrentSecond();
        this.videoService.cursorSecond.set(second);
        console.log(`Cursor at second: ${second}`);
      }
    }
  }

  @HostListener('document:mouseup')
  stopDragging(): void {
    if (this.isDragging) {
      this.isDragging = false;
      console.log(
        `Cursor position fixed at second: ${this.getCurrentSecond()}`
      );
    }
  }

  getCurrentSecond(): number {
    if (this.timelineWidth === 0) return 0;
    return Math.floor(
      (this.cursorPosition / this.timelineWidth) * this.totalDuration()
    );
  }

  async onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      const updatedList = [...this.timelineList()];
      moveItemInArray(updatedList, event.previousIndex, event.currentIndex);
      this.videoService.timelineList.set(updatedList);
    } else {
      const file = event.previousContainer.data[event.previousIndex];

      const newFile = {
        ...file,
        frames: [],
      };

      await this.videoService.generateFramesForVideo(newFile);

      this.videoService.timelineList.set([...this.timelineList(), newFile]);
    }

    this.videoService.recalculateTotalDuration();
    this.cdr.markForCheck();
  }
}
