import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  effect,
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
