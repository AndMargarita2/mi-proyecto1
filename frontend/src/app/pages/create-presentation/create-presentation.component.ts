import {
  Component,
  ViewChild,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { HeaderComponent } from '../../components/header.component';

interface Slide {
  id: number;
  elements: Element[];
  /** Color de fondo de la diapositiva (lienzo). */
  backgroundColor?: string;
}

interface LastPresentationMeta {
  title: string;
  path: string;
  at: string;
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
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  selected?: boolean;
}

@Component({
  selector: 'app-create-presentation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DragDropModule,
    HeaderComponent
  ],
  templateUrl: './create-presentation.component.html',
  styleUrl: './create-presentation.component.css'
})
export class CreatePresentationComponent implements OnInit, OnDestroy {
  private static readonly LS_LAST_PRESENTATION = 'mp_editor_ultima_presentacion';

  private readonly router = inject(Router);

  @ViewChild('mainCanvas') mainCanvas!: ElementRef;
  @ViewChild('presentationRoot') presentationRoot?: ElementRef<HTMLElement>;

  /** Expuesto para plantilla (porcentaje de opacidad en el menú de formas). */
  readonly Math = Math;

  /** Lienzo lógico 16:9 alineado con `.main-canvas` (max-width 1200px). */
  protected readonly stageWidth = 1200;
  protected readonly stageHeight = 675;

  protected presentationTitle = 'Presentacion2';
  /** Texto mostrado para la última visita al editor (desde localStorage). */
  protected lastPresentationMeta: LastPresentationMeta | null = null;
  protected menuSearchQuery = '';
  protected editorMenuOpen = false;
  protected presentationMode = false;
  protected presentationScale = 1;
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
  /** Valores por defecto del ribbon cuando no hay un texto seleccionado. */
  protected ribbonTextColor = '#111827';
  protected ribbonTextBold = false;
  protected ribbonTextAlign: 'left' | 'center' | 'right' = 'left';
  /** Próxima forma / flecha insertada. */
  protected nextShapeFillColor = '#6366f1';
  protected nextArrowColor = '#3b82f6';
  protected nextShapeOpacity = 1;

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

  ngOnInit(): void {
    this.refreshLastPresentationFromStorage();
    this.persistLastPresentationView();
  }

  ngOnDestroy(): void {
    this.persistLastPresentationView();
  }

  get currentSlide(): Slide {
    return this.slides[this.currentSlideIndex];
  }

  private refreshLastPresentationFromStorage(): void {
    try {
      const raw = localStorage.getItem(CreatePresentationComponent.LS_LAST_PRESENTATION);
      this.lastPresentationMeta = raw ? (JSON.parse(raw) as LastPresentationMeta) : null;
    } catch {
      this.lastPresentationMeta = null;
    }
  }

  private persistLastPresentationView(): void {
    try {
      const payload: LastPresentationMeta = {
        title: (this.presentationTitle || 'Sin título').trim() || 'Sin título',
        path: '/crear-presentacion',
        at: new Date().toISOString()
      };
      localStorage.setItem(
        CreatePresentationComponent.LS_LAST_PRESENTATION,
        JSON.stringify(payload)
      );
      this.lastPresentationMeta = payload;
    } catch {
      /* modo privado o storage no disponible */
    }
  }

  protected openLastPresentationFromMenu(): void {
    this.editorMenuOpen = false;
    void this.router.navigateByUrl('/crear-presentacion');
  }

  protected runMenuSearch(): void {
    const q = (this.menuSearchQuery || '').trim();
    this.editorMenuOpen = false;
    void this.router.navigate(['/catalogo'], q ? { queryParams: { q } } : {});
  }

  /** Estilo del contenedor escalado en modo presentación (coordenadas en px del lienzo lógico). */
  getPresentationStageWrapperStyle(): Record<string, string> {
    return {
      width: this.stageWidth + 'px',
      height: this.stageHeight + 'px',
      transform: `scale(${this.presentationScale})`,
      transformOrigin: 'center center',
      backgroundColor: this.currentSlide.backgroundColor || '#ffffff'
    };
  }

  private updatePresentationScale(): void {
    if (!this.presentationMode) return;
    const marginX = 48;
    const marginY = 100;
    const sx = (window.innerWidth - marginX) / this.stageWidth;
    const sy = (window.innerHeight - marginY) / this.stageHeight;
    this.presentationScale = Math.max(0.15, Math.min(sx, sy));
  }

  startPresentation(): void {
    this.selectedElement = null;
    this.showShapeMenu = false;
    this.activePanel = null;
    this.presentationMode = true;
    setTimeout(() => {
      this.updatePresentationScale();
      const el = this.presentationRoot?.nativeElement;
      if (el?.requestFullscreen) {
        el.requestFullscreen().catch(() => {
          /* Pantalla completa del navegador opcional; el overlay ya cubre el viewport. */
        });
      }
      el?.focus();
    }, 0);
  }

  endPresentation(): void {
    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .then(() => {
          this.presentationMode = false;
        })
        .catch(() => {
          this.presentationMode = false;
        });
    } else {
      this.presentationMode = false;
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updatePresentationScale();
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    if (!document.fullscreenElement && this.presentationMode) {
      this.presentationMode = false;
    }
  }

  toggleEditorMenu(): void {
    this.editorMenuOpen = !this.editorMenuOpen;
    if (this.editorMenuOpen) {
      this.refreshLastPresentationFromStorage();
    }
  }

  onPresentationTitleChange(value: string): void {
    this.presentationTitle = (value ?? '').trimEnd();
    this.persistLastPresentationView();
  }

  @HostListener('document:keydown', ['$event'])
  onPresentationKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.editorMenuOpen && !this.presentationMode) {
      this.editorMenuOpen = false;
      event.preventDefault();
      return;
    }
    if (!this.presentationMode) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.endPresentation();
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      this.nextSlide();
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      this.previousSlide();
    }
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
      fontSize: this.getTextFontSize(),
      color: this.getTextColor(),
      fontWeight: this.isTextBold() ? 'bold' : 'normal',
      textAlign: this.getTextAlign()
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
      color: isArrow ? this.nextArrowColor : this.nextShapeFillColor,
      opacity: this.nextShapeOpacity
    };
    this.currentSlide.elements.push(element);
    this.showShapeMenu = false;
  }

  selectElement(element: Element): void {
    this.currentSlide.elements.forEach(el => el.selected = false);
    element.selected = true;
    this.selectedElement = element;
  }

  /** Tamaño de fuente del texto en edición (selección o valores por defecto del ribbon). */
  getTextFontSize(): number {
    if (this.selectedElement?.type === 'text') {
      return Math.round(this.selectedElement.fontSize ?? 24);
    }
    return this.textInputSize;
  }

  setTextFontSize(value: number): void {
    const n = Math.min(120, Math.max(8, Math.round(value)));
    if (this.selectedElement?.type === 'text') {
      this.selectedElement.fontSize = n;
    } else {
      this.textInputSize = n;
    }
  }

  getTextColor(): string {
    return this.selectedElement?.type === 'text'
      ? (this.selectedElement.color ?? '#111827')
      : this.ribbonTextColor;
  }

  setTextColor(hex: string): void {
    if (this.selectedElement?.type === 'text') {
      this.selectedElement.color = hex;
    } else {
      this.ribbonTextColor = hex;
    }
  }

  isTextBold(): boolean {
    if (this.selectedElement?.type === 'text') {
      return this.selectedElement.fontWeight === 'bold';
    }
    return this.ribbonTextBold;
  }

  toggleTextBold(): void {
    if (this.selectedElement?.type === 'text') {
      this.selectedElement.fontWeight =
        this.selectedElement.fontWeight === 'bold' ? 'normal' : 'bold';
    } else {
      this.ribbonTextBold = !this.ribbonTextBold;
    }
  }

  getTextAlign(): 'left' | 'center' | 'right' {
    if (this.selectedElement?.type === 'text') {
      return this.selectedElement.textAlign ?? 'left';
    }
    return this.ribbonTextAlign;
  }

  setTextAlign(align: 'left' | 'center' | 'right'): void {
    if (this.selectedElement?.type === 'text') {
      this.selectedElement.textAlign = align;
    } else {
      this.ribbonTextAlign = align;
    }
  }

  showTextTypographyRibbon(): boolean {
    return this.activePanel === 'texto' || this.selectedElement?.type === 'text';
  }

  updateSlideBackground(color: string): void {
    this.currentSlide.backgroundColor = color;
  }

  setNextShapeOpacity(value: number): void {
    this.nextShapeOpacity = Math.min(1, Math.max(0.15, value));
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

  /** Estilos en modo presentación (sin marco de selección ni interacción de edición). */
  getPresentationElementStyle(element: Element): Record<string, unknown> {
    return this.getElementStyle({ ...element, selected: false });
  }

  getElementStyle(element: Element): any {
    // Definir color por defecto si no existe
    const elementColor = element.color || '#3b82f6'; // Azul por defecto

    const justifyFromAlign = (a: string | undefined): string => {
      if (a === 'right') return 'flex-end';
      if (a === 'center') return 'center';
      return 'flex-start';
    };

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
      color: elementColor,
      ...(element.opacity != null ? { opacity: element.opacity } : {})
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
      const align = element.textAlign ?? 'left';
      return {
        ...baseStyle,
        color: elementColor,
        fontSize: (element.fontSize ?? 24) + 'px',
        fontWeight: element.fontWeight === 'bold' ? 700 : 400,
        justifyContent: justifyFromAlign(align),
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

  protected lastPresentationDateLabel(): string {
    if (!this.lastPresentationMeta?.at) return '';
    try {
      return new Date(this.lastPresentationMeta.at).toLocaleString();
    } catch {
      return '';
    }
  }
}