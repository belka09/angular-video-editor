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
import { ToasterService } from '../../services/toaster.service';

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
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      this.cdr.markForCheck();
    });
  }

  @HostListener('document:mousemove', ['$event'])
  public onDrag(event: MouseEvent): void {
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
        this.toasterService.showToast(
          'warning',
          `Cursor moved to second: ${second}`
        );
      }
    }
  }

  @HostListener('document:mouseup')
  public stopDragging(): void {
    if (this.isDragging) {
      this.isDragging = false;
      const second = this.getCurrentSecond();
      this.toasterService.showToast(
        'success',
        `Dragging stopped. Cursor fixed at second: ${second}`
      );
    }
  }

  public startDragging(event: MouseEvent): void {
    const timelineElement = document.getElementById('timeline');
    if (timelineElement) {
      this.timelineWidth = timelineElement.getBoundingClientRect().width;
      this.isDragging = true;
      this.toasterService.showToast('warning', 'Dragging started.');
    }
    event.preventDefault();
  }

  public async onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      const updatedList = [...this.timelineList()];
      moveItemInArray(updatedList, event.previousIndex, event.currentIndex);
      this.videoService.timelineList.set(updatedList);
      this.toasterService.showToast(
        'success',
        'Video order updated successfully!'
      );
    } else {
      const file = event.previousContainer.data[event.previousIndex];

      const newFile = {
        ...file,
        frames: [],
      };

      try {
        await this.videoService.generateFramesForVideo(newFile);
        this.videoService.timelineList.set([...this.timelineList(), newFile]);
        this.toasterService.showToast(
          'success',
          'Video added to timeline successfully!'
        );
      } catch (err) {
        this.toasterService.showToast(
          'error',
          'Failed to add video to timeline.'
        );
      }
    }

    this.videoService.recalculateTotalDuration();
    this.cdr.markForCheck();
  }

  private getCurrentSecond(): number {
    if (this.timelineWidth === 0) return 1;
    return (
      Math.floor(
        (this.cursorPosition / this.timelineWidth) * this.totalDuration()
      ) + 1
    );
  }
}
