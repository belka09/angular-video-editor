import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  effect,
  HostListener,
  ViewChild,
  ElementRef,
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
import { TimeFormatPipe } from '../../pipes/timeFormat.pipe';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, DragDropModule, TimeFormatPipe],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  timelineList = computed(() => this.videoService.timelineList());
  totalDuration = computed(() => this.videoService.totalDuration());

  cursorPosition = 0;
  isDragging = false;

  @ViewChild('timelineWrapper') timelineWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('timelineEl') timeline!: ElementRef<HTMLDivElement>;

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
      const wrapperRect =
        this.timelineWrapper.nativeElement.getBoundingClientRect();
      const innerContainer = this.timeline.nativeElement;
      const cursorInContainer = Math.max(
        0,
        Math.min(
          event.clientX - wrapperRect.left + innerContainer.scrollLeft,
          innerContainer.scrollWidth
        )
      );

      this.cursorPosition = cursorInContainer;

      const correspondingSecond = this.getCurrentSecond(cursorInContainer);
      this.videoService.cursorSecond.set(correspondingSecond);
    }
  }

  @HostListener('document:mouseup')
  public stopDragging(): void {
    if (this.isDragging) {
      this.isDragging = false;
    }
  }

  public startDragging(event: MouseEvent): void {
    this.isDragging = true;
    event.preventDefault();
  }

  private getCurrentSecond(cursorPosition: number): number {
    if (!this.timeline || !this.timelineWrapper) return 1;

    const totalSeconds = this.totalDuration();
    const scrollLeft = this.timelineWrapper.nativeElement.scrollLeft;
    const adjustedCursorPosition = cursorPosition + scrollLeft;

    const timelineWidth = this.timeline.nativeElement.scrollWidth;

    return Math.ceil((adjustedCursorPosition / timelineWidth) * totalSeconds);
  }

  public async onDrop(event: CdkDragDrop<any[]>) {
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

      try {
        await this.videoService.generateFramesForVideo(newFile);
        this.videoService.timelineList.set([...this.timelineList(), newFile]);
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
}
