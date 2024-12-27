import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  @Input() timeline: Array<{
    name: string;
    duration: number;
    preview: string;
  }> = [];
  totalDuration = 0;

  onDrop(event: any) {
    const file = event.item.data;
    this.timeline.push({ ...file });
    this.totalDuration += file.duration;
  }
}
