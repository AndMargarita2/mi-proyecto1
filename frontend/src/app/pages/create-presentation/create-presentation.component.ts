import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header.component';
import { ButtonComponent } from '../../components/button.component';

@Component({
  selector: 'app-create-presentation',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ButtonComponent],
  templateUrl: './create-presentation.component.html',
  styleUrl: './create-presentation.component.css'
})
export class CreatePresentationComponent {
  protected readonly slides = [1, 2, 3, 4];
  protected presentationTitle = 'Presentacion2';
}
