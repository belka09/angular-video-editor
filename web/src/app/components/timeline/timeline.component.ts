import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

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

  onDrop(event: any) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        this.timelineList,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const file = event.previousContainer.data[event.previousIndex];
      this.timelineList.push({ ...file });
      // this.totalDuration += file.duration;
    }
    // this.totalDuration += file.duration;
    // console.log('totalDuration', this.totalDuration);
  }
}
