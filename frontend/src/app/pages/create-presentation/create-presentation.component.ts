import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header.component';
import { ButtonComponent } from '../../components/button.component';
import { InputComponent } from '../../components/input.component';

interface Slide {
  id: number;
  elements: Element[];
}

interface Element {
  id: string;
  type: 'text' | 'shape' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string;
  fontSize?: number;
  selected?: boolean;
}

@Component({
  selector: 'app-create-presentation',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, ButtonComponent, InputComponent],
  templateUrl: './create-presentation.component.html',
  styleUrl: './create-presentation.component.css'
})
export class CreatePresentationComponent {
  @ViewChild('mainCanvas') mainCanvas!: ElementRef;

  protected presentationTitle = 'Presentacion2';
  protected slides: Slide[] = [
    { id: 1, elements: [] },
    { id: 2, elements: [] },
    { id: 3, elements: [] },
    { id: 4, elements: [] }
  ];
  
  protected currentSlideIndex = 0;
  protected activePanel: 'elementos' | 'texto' | null = null;
  protected selectedElement: Element | null = null;
  protected newTextContent = '';
  protected textInputSize = 16;

  // Drag state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragElement: Element | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  get currentSlide(): Slide {
    return this.slides[this.currentSlideIndex];
  }

  constructor() {
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));
  }

  // Panel actions
  togglePanel(panel: 'elementos' | 'texto'): void {
    this.activePanel = this.activePanel === panel ? null : panel;
  }

  // Drag and drop
  startDrag(element: Element, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragging = true;
    this.dragElement = element;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragOffsetX = element.x;
    this.dragOffsetY = element.y;
    
    this.selectElement(element);
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.dragElement) return;

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    this.dragElement.x = Math.max(0, this.dragOffsetX + deltaX);
    this.dragElement.y = Math.max(0, this.dragOffsetY + deltaY);
  }

  private onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
    this.dragElement = null;
  }

  // Element management
  addTextElement(): void {
    if (!this.newTextContent.trim()) return;
    
    const element: Element = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      content: this.newTextContent,
      fontSize: this.textInputSize,
      color: '#000000'
    };
    
    this.currentSlide.elements.push(element);
    this.newTextContent = '';
    this.textInputSize = 16;
  }

  addShapeElement(shape: 'rectangle' | 'circle'): void {
    const element: Element = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      x: 100,
      y: 100,
      width: shape === 'rectangle' ? 150 : 100,
      height: shape === 'rectangle' ? 100 : 100,
      content: shape,
      color: '#3b82f6'
    };
    
    this.currentSlide.elements.push(element);
  }

  selectElement(element: Element): void {
    this.currentSlide.elements.forEach(el => el.selected = false);
    element.selected = true;
    this.selectedElement = element;
  }

  deleteElement(element: Element): void {
    const index = this.currentSlide.elements.indexOf(element);
    if (index > -1) {
      this.currentSlide.elements.splice(index, 1);
      this.selectedElement = null;
    }
  }

  updateElementPosition(element: Element, dx: number, dy: number): void {
    element.x += dx;
    element.y += dy;
  }

  // Slide management
  previousSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.selectedElement = null;
    }
  }

  nextSlide(): void {
    if (this.currentSlideIndex < this.slides.length - 1) {
      this.currentSlideIndex++;
      this.selectedElement = null;
    }
  }

  addSlide(): void {
    const newId = Math.max(...this.slides.map(s => s.id)) + 1;
    this.slides.push({ id: newId, elements: [] });
  }

  deleteSlide(index: number): void {
    if (this.slides.length > 1) {
      this.slides.splice(index, 1);
      if (this.currentSlideIndex >= this.slides.length) {
        this.currentSlideIndex = this.slides.length - 1;
      }
    }
  }

  selectSlide(index: number): void {
    this.currentSlideIndex = index;
    this.selectedElement = null;
  }

  getElementStyle(element: Element): any {
    const baseStyle = {
      left: element.x + 'px',
      top: element.y + 'px',
      width: element.width + 'px',
      height: element.height + 'px',
      border: element.selected ? '2px solid #2563eb' : '1px solid #ccc'
    };

    if (element.type === 'shape') {
      const shape = element.content;
      if (shape === 'circle') {
        return {
          ...baseStyle,
          backgroundColor: element.color,
          borderRadius: '50%'
        };
      } else if (shape === 'rectangle') {
        return {
          ...baseStyle,
          backgroundColor: element.color,
          borderRadius: '4px'
        };
      }
    } else if (element.type === 'text') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        color: element.color,
        fontSize: element.fontSize + 'px',
        padding: '4px'
      };
    }
    return baseStyle;
  }

  updateElementColor(color: string): void {
    if (this.selectedElement) {
      this.selectedElement.color = color;
    }
  }

  updateElementSize(width: number | string, height: number | string): void {
    if (this.selectedElement) {
      this.selectedElement.width = typeof width === 'string' ? parseInt(width, 10) : width;
      this.selectedElement.height = typeof height === 'string' ? parseInt(height, 10) : height;
    }
  }
}
