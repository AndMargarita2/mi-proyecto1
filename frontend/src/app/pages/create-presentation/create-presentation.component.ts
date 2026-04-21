import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { HeaderComponent } from '../../components/header.component';

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
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    HeaderComponent
  ],
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
  protected selectedElement: Element | null = null;
  protected newTextContent = '';
  protected textInputSize = 24;

  // Control de interfaz
  protected activePanel: 'elementos' | 'texto' | null = null;
  protected showShapeMenu = false;

  // Catálogo de Formas
  protected shapeOptions = [
    { type: 'rectangle', icon: '⬜', label: 'Rectángulo' },
    { type: 'circle', icon: '⚪', label: 'Círculo' },
    { type: 'triangle', icon: '▲', label: 'Triángulo' },
    { type: 'diamond', icon: '💎', label: 'Diamante' },
    { type: 'hexagon', icon: '⬢', label: 'Hexágono' },
    { type: 'star', icon: '⭐', label: 'Estrella' },
    { type: 'pentagon', icon: '⬠', label: 'Pentágono' },
    { type: 'ellipse', icon: '⬭', label: 'Elipse' },
    { type: 'parallelogram', icon: '▱', label: 'Paralelogramo' },
    { type: 'pill', icon: '💊', label: 'Píldora' }
  ];

  // Catálogo de Flechas
  protected arrowOptions = [
    { type: 'arrow-right', icon: '→', label: 'Derecha' },
    { type: 'arrow-left', icon: '←', label: 'Izquierda' },
    { type: 'arrow-up', icon: '↑', label: 'Arriba' },
    { type: 'arrow-down', icon: '↓', label: 'Abajo' },
    { type: 'arrow-both', icon: '↔', label: 'Doble' }
  ];

  get currentSlide(): Slide {
    return this.slides[this.currentSlideIndex];
  }

  // --- LÓGICA DE ELEMENTOS ---

  addTextElement(): void {
    if (!this.newTextContent.trim()) return;
    const element: Element = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      width: 250,
      height: 60,
      content: this.newTextContent,
      fontSize: this.textInputSize,
      color: '#000000'
    };
    this.currentSlide.elements.push(element);
    this.newTextContent = '';
  }

  addShapeElement(shapeType: string): void {
    const isArrow = shapeType.startsWith('arrow');
    const element: Element = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      x: 150,
      y: 150,
      width: 120,
      height: 120,
      content: shapeType,
      color: isArrow ? '#3b82f6' : '#6366f1' // Color distinto para flechas por defecto
    };
    this.currentSlide.elements.push(element);
    this.showShapeMenu = false;
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

  // Al terminar el drag, calculamos la posición real basada en el evento
  onDragEnd(event: CdkDragEnd, element: Element): void {
    // Obtener el desplazamiento delta del movimiento de arrastre
    const delta = event.distance;
    
    // Actualizar la posición del elemento con el desplazamiento
    if (delta) {
      element.x = element.x + delta.x;
      element.y = element.y + delta.y;
    }
    
    // Resetear el drag para que no se acumule el transform
    event.source.reset();
  }

  // --- GESTIÓN DE ESTILOS DINÁMICOS ---

  getElementStyle(element: Element): any {
    // Definir color por defecto si no existe
    const elementColor = element.color || '#3b82f6'; // Azul por defecto

    const baseStyle: any = {
      left: element.x + 'px',
      top: element.y + 'px',
      width: element.width + 'px',
      height: element.height + 'px',
      position: 'absolute',
      zIndex: element.selected ? 10 : 1,
      border: element.selected ? '2px solid #2563eb' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'border 0.2s ease',
      backgroundColor: 'transparent',
      color: elementColor
    };

    if (element.type === 'shape') {
      let clipPath = 'none';
      const shape = element.content;

      // Si es una flecha, no usar clip-path ni fondo
      const isArrow = shape && shape.startsWith && shape.startsWith('arrow');
      if (isArrow) {
        return {
          ...baseStyle,
          fontSize: Math.max(element.width, element.height) * 0.7 + 'px',
          color: elementColor,
          backgroundColor: 'transparent',
          borderRadius: '0',
        };
      }

      // Definición de formas geométricas mediante CSS Clip-Path
      switch (shape) {
        case 'triangle': clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'; break;
        case 'diamond': clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'; break;
        case 'hexagon': clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'; break;
        case 'star': clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; break;
        case 'pentagon': clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'; break;
        case 'parallelogram': clipPath = 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)'; break;
        case 'ellipse': baseStyle['borderRadius'] = '50%'; break;
      }

      return {
        ...baseStyle,
        clipPath: clipPath,
        borderRadius: shape === 'circle' ? '50%' : (shape === 'pill' ? '50px' : baseStyle['borderRadius'] || '0'),
        backgroundColor: elementColor,
        color: 'inherit'
      };
    }

    if (element.type === 'text') {
      return {
        ...baseStyle,
        color: elementColor,
        fontSize: element.fontSize + 'px',
        backgroundColor: 'transparent'
      };
    }

    return baseStyle;
  }

  getArrowIcon(shapeType: string): string {
    const allOptions = [...this.shapeOptions, ...this.arrowOptions];
    const found = allOptions.find(opt => opt.type === shapeType);
    return found ? found.icon : '';
  }

  // --- GESTIÓN DE DIAPOSITIVAS ---

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
    const newId = this.slides.length > 0 ? Math.max(...this.slides.map(s => s.id)) + 1 : 1;
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

  // --- ACTUALIZACIÓN DE PROPIEDADES ---

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

  togglePanel(panel: 'elementos' | 'texto'): void {
    this.activePanel = this.activePanel === panel ? null : panel;
  }
}