import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ToasterMessage, ToasterService } from '../../services/toaster.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss'],
})
export class ToasterComponent {
  constructor(public toasterService: ToasterService) {}
}
