import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllScenesComponent } from '../all-scenes/all-scenes.component';
import { PreviewComponent } from '../preview/preview.component';
import { TimelineComponent } from '../timeline/timeline.component';

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

  onPlayVideo(url: string) {
    this.selectedVideoUrl = url;
  }
}
