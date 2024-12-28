import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  timelineList: Array<{
    name: string;
    duration: number;
    preview: string;
    url: string;
  }> = [];

  totalDuration = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        this.timelineList,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const file = event.previousContainer.data[event.previousIndex];
      this.timelineList.push({ ...file });
    }
    this.recalculateTotalDuration();

    this.cdr.markForCheck();
  }

  createArray(count: number): number[] {
    return [...new Array(count).keys()];
  }

  private recalculateTotalDuration() {
    this.totalDuration = this.timelineList.reduce(
      (acc, clip) => acc + clip.duration,
      0
    );

    this.cdr.markForCheck();
  }
}
