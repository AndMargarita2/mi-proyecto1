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
  /** Color del contorno de la forma (0 = sin contorno vía strokeWidth). */
  strokeColor?: string;
  /** Grosor del contorno en px; 0 significa sin contorno. */
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  /** Si es false, la forma se dibuja sin relleno (solo contorno). Default: true. */
  hasFill?: boolean;
}

/** Descripción de cómo dibujar el SVG de una forma ya colocada en el lienzo. */
interface ShapeRenderData {
  kind: 'rect' | 'ellipse' | 'polygon';
  rectAttrs?: { x: number; y: number; width: number; height: number; rx: number };
  ellipseAttrs?: { cx: number; cy: number; rx: number; ry: number };
  points?: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  dashArray: string;
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
  @ViewChild('imageFileInput') imageFileInput!: ElementRef<HTMLInputElement>;

  /** Máximo lado (ancho o alto) en px al insertar una imagen nueva; se preserva su relación de aspecto. */
  private static readonly MAX_IMAGE_INSERT_SIZE = 360;

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
  /** Id del elemento de texto que se está editando in-place en el lienzo. */
  protected editingElementId: string | null = null;
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
    { type: 'rectangle', label: 'Rectángulo' },
    { type: 'circle', label: 'Círculo' },
    { type: 'triangle', label: 'Triángulo' },
    { type: 'diamond', label: 'Diamante' },
    { type: 'hexagon', label: 'Hexágono' },
    { type: 'star', label: 'Estrella' },
    { type: 'pentagon', label: 'Pentágono' },
    { type: 'ellipse', label: 'Elipse' },
    { type: 'parallelogram', label: 'Paralelogramo' },
    { type: 'pill', label: 'Píldora' }
  ];

  // Catálogo de Flechas
  protected arrowOptions = [
    { type: 'arrow-right', label: 'Derecha' },
    { type: 'arrow-left', label: 'Izquierda' },
    { type: 'arrow-up', label: 'Arriba' },
    { type: 'arrow-down', label: 'Abajo' },
    { type: 'arrow-both', label: 'Doble' }
  ];

  /** Path SVG (viewBox 24x24) por tipo de flecha; se usa en el menú y en el lienzo. */
  private static readonly ARROW_PATHS: Record<string, string> = {
    'arrow-right': 'M4.5 12h15m0 0-6-6m6 6-6 6',
    'arrow-left': 'M19.5 12h-15m0 0 6-6m-6 6 6 6',
    'arrow-up': 'M12 19.5V4.5m0 0-6 6m6-6 6 6',
    'arrow-down': 'M12 4.5v15m0 0-6-6m6 6 6-6',
    'arrow-both': 'M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4'
  };

  /** Vértices (fracción de ancho, fracción de alto) de cada forma poligonal, para dibujarla como <polygon> SVG. */
  private static readonly SHAPE_POINT_FRACTIONS: Record<string, [number, number][]> = {
    triangle: [[0.5, 0], [0, 1], [1, 1]],
    diamond: [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]],
    hexagon: [[0.25, 0], [0.75, 0], [1, 0.5], [0.75, 1], [0.25, 1], [0, 0.5]],
    star: [
      [0.5, 0], [0.61, 0.35], [0.98, 0.35], [0.68, 0.57], [0.79, 0.91],
      [0.5, 0.70], [0.21, 0.91], [0.32, 0.57], [0.02, 0.35], [0.39, 0.35]
    ],
    pentagon: [[0.5, 0], [1, 0.38], [0.82, 1], [0.18, 1], [0, 0.38]],
    parallelogram: [[0.25, 0], [1, 0], [0.75, 1], [0, 1]]
  };

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
    this.clearSelection();
    this.editingElementId = null;
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

  /** Inserta un recuadro de texto vacío directamente en el lienzo y lo deja listo para escribir. */
  insertTextElement(): void {
    const element: Element = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: (this.stageWidth - 250) / 2,
      y: (this.stageHeight - 60) / 2,
      width: 250,
      height: 60,
      content: '',
      fontSize: this.getTextFontSize(),
      color: this.getTextColor(),
      fontWeight: this.isTextBold() ? 'bold' : 'normal',
      textAlign: this.getTextAlign()
    };
    this.currentSlide.elements.push(element);
    this.selectElement(element);
    this.editingElementId = element.id;
    this.showShapeMenu = false;
  }

  /** Abre el selector de archivos nativo para elegir una imagen. */
  triggerImageUpload(): void {
    this.imageFileInput.nativeElement.click();
  }

  /** Lee el archivo elegido, calcula su tamaño de inserción y lo agrega al lienzo. */
  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = ''; // permite volver a elegir el mismo archivo más adelante
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        this.insertImageElement(dataUrl, img.naturalWidth || 1, img.naturalHeight || 1);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  private insertImageElement(dataUrl: string, naturalWidth: number, naturalHeight: number): void {
    const maxSize = CreatePresentationComponent.MAX_IMAGE_INSERT_SIZE;
    const ratio = naturalWidth / naturalHeight;
    let width = naturalWidth;
    let height = naturalHeight;
    if (width > maxSize || height > maxSize) {
      if (ratio >= 1) {
        width = maxSize;
        height = Math.round(maxSize / ratio);
      } else {
        height = maxSize;
        width = Math.round(maxSize * ratio);
      }
    }

    const element: Element = {
      id: `image-${Date.now()}`,
      type: 'image',
      x: (this.stageWidth - width) / 2,
      y: (this.stageHeight - height) / 2,
      width,
      height,
      content: dataUrl
    };
    this.currentSlide.elements.push(element);
    this.selectElement(element);
    this.showShapeMenu = false;
  }

  /** Reabre un recuadro de texto existente para editarlo con doble clic. */
  startEditingText(element: Element): void {
    if (element.type !== 'text') return;
    this.selectElement(element);
    this.editingElementId = element.id;
  }

  /** Cierra la edición in-place; si quedó vacío, elimina el recuadro. */
  stopEditingText(element: Element): void {
    this.editingElementId = null;
    if (!element.content.trim()) {
      this.deleteElement(element);
    }
  }

  /** Enter confirma (Mayús+Enter = salto de línea), Escape cancela la edición. */
  onTextEditKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      (event.target as HTMLElement).blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      (event.target as HTMLElement).blur();
    }
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

  /** Limpia la selección (y el flag `.selected` de cada elemento, para que no quede el borde pegado). */
  clearSelection(): void {
    this.currentSlide.elements.forEach(el => el.selected = false);
    this.selectedElement = null;
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

  // --- ORDEN DE APILADO (Z-INDEX) ---
  // El orden visual (de atrás hacia adelante) lo da la posición del elemento
  // dentro de `elements`: el último del arreglo se dibuja encima.

  bringToFront(element: Element): void {
    const elements = this.currentSlide.elements;
    const index = elements.indexOf(element);
    if (index === -1 || index === elements.length - 1) return;
    elements.splice(index, 1);
    elements.push(element);
  }

  sendToBack(element: Element): void {
    const elements = this.currentSlide.elements;
    const index = elements.indexOf(element);
    if (index <= 0) return;
    elements.splice(index, 1);
    elements.unshift(element);
  }

  bringForward(element: Element): void {
    const elements = this.currentSlide.elements;
    const index = elements.indexOf(element);
    if (index === -1 || index === elements.length - 1) return;
    [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
  }

  sendBackward(element: Element): void {
    const elements = this.currentSlide.elements;
    const index = elements.indexOf(element);
    if (index <= 0) return;
    [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
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

  /** Estilos en modo presentación (sin marco de selección ni caja de edición de texto). */
  getPresentationElementStyle(element: Element): Record<string, unknown> {
    return this.getElementStyle({ ...element, selected: false }, true);
  }

  /** Borde del elemento: selección > caja punteada de texto (solo editor) > sin borde. */
  private getElementBorder(element: Element, isPresentation: boolean): string {
    if (element.selected) return '2px solid #2563eb';
    if (!isPresentation && element.type === 'text') return '1px dashed rgba(100, 116, 139, 0.6)';
    return 'none';
  }

  getElementStyle(element: Element, isPresentation = false): any {
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
      border: this.getElementBorder(element, isPresentation),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'border 0.2s ease',
      backgroundColor: 'transparent',
      color: elementColor,
      ...(element.opacity != null ? { opacity: element.opacity } : {})
    };

    if (element.type === 'shape') {
      // El relleno/contorno de la forma (o el trazo de la flecha) se dibuja con un <svg>
      // interno (ver getShapeRenderData/getArrowPath); el wrapper queda transparente.
      return {
        ...baseStyle,
        color: elementColor,
        backgroundColor: 'transparent',
        borderRadius: '0'
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

  /** Clip-path / border-radius de cada forma geométrica; compartido entre el lienzo y la vista previa del menú. */
  private getShapeVisualStyle(shapeType: string): { clipPath: string; borderRadius: string } {
    switch (shapeType) {
      case 'triangle':
        return { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius: '0' };
      case 'diamond':
        return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', borderRadius: '0' };
      case 'hexagon':
        return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', borderRadius: '0' };
      case 'star':
        return { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', borderRadius: '0' };
      case 'pentagon':
        return { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', borderRadius: '0' };
      case 'parallelogram':
        return { clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)', borderRadius: '0' };
      case 'ellipse':
      case 'circle':
        return { clipPath: 'none', borderRadius: '50%' };
      case 'pill':
        return { clipPath: 'none', borderRadius: '50px' };
      default:
        return { clipPath: 'none', borderRadius: '0' };
    }
  }

  /** Miniatura de la forma en el menú "Formas", con el color de relleno que se usará al insertarla. */
  getShapePreviewStyle(shapeType: string): Record<string, string> {
    const { clipPath, borderRadius } = this.getShapeVisualStyle(shapeType);
    return { clipPath, borderRadius, backgroundColor: this.nextShapeFillColor };
  }

  /** Path SVG del ícono de flecha, usado tanto en el menú como al dibujarla en el lienzo. */
  getArrowPath(shapeType: string): string {
    return CreatePresentationComponent.ARROW_PATHS[shapeType] || '';
  }

  /** stroke-dasharray según el estilo de línea elegido, escalado al grosor del trazo. */
  getStrokeDashArray(style: Element['strokeStyle'] | undefined, strokeWidth: number): string {
    if (style === 'dashed') return `${strokeWidth * 2.5} ${strokeWidth * 1.5}`;
    if (style === 'dotted') return `${strokeWidth} ${strokeWidth * 1.4}`;
    return 'none';
  }

  private getShapeSvgKind(shapeType: string): 'rect' | 'ellipse' | 'polygon' {
    if (shapeType === 'circle' || shapeType === 'ellipse') return 'ellipse';
    if (CreatePresentationComponent.SHAPE_POINT_FRACTIONS[shapeType]) return 'polygon';
    return 'rect'; // rectangle, pill
  }

  /**
   * Atributos SVG (rect/ellipse/polygon + relleno/contorno) para dibujar una forma ya
   * colocada en el lienzo con contorno nítido, sin las limitaciones del clip-path CSS.
   */
  getShapeRenderData(element: Element): ShapeRenderData {
    const shape = element.content;
    const width = element.width;
    const height = element.height;
    const strokeWidth = Math.max(0, element.strokeWidth ?? 0);
    const hasFill = element.hasFill !== false;
    const fill = hasFill ? (element.color || '#3b82f6') : 'none';
    const stroke = strokeWidth > 0 ? (element.strokeColor || '#1e293b') : 'none';
    const dashArray = this.getStrokeDashArray(element.strokeStyle, strokeWidth);
    const inset = strokeWidth / 2;
    const kind = this.getShapeSvgKind(shape);

    if (kind === 'ellipse') {
      return {
        kind, fill, stroke, strokeWidth, dashArray,
        ellipseAttrs: {
          cx: width / 2,
          cy: height / 2,
          rx: Math.max(0, width / 2 - inset),
          ry: Math.max(0, height / 2 - inset)
        }
      };
    }

    if (kind === 'rect') {
      const rx = shape === 'pill' ? Math.max(0, height / 2 - inset) : 0;
      return {
        kind, fill, stroke, strokeWidth, dashArray,
        rectAttrs: {
          x: inset,
          y: inset,
          width: Math.max(0, width - strokeWidth),
          height: Math.max(0, height - strokeWidth),
          rx
        }
      };
    }

    const fractions = CreatePresentationComponent.SHAPE_POINT_FRACTIONS[shape] || [];
    const points = fractions
      .map(([fx, fy]) => `${inset + fx * (width - strokeWidth)},${inset + fy * (height - strokeWidth)}`)
      .join(' ');
    return { kind, fill, stroke, strokeWidth, dashArray, points };
  }

  updateElementStrokeColor(color: string): void {
    if (this.selectedElement) this.selectedElement.strokeColor = color;
  }

  updateElementStrokeWidth(width: number): void {
    if (this.selectedElement) this.selectedElement.strokeWidth = Math.max(0, Math.min(40, Math.round(width)));
  }

  setElementStrokeStyle(style: 'solid' | 'dashed' | 'dotted'): void {
    if (this.selectedElement) this.selectedElement.strokeStyle = style;
  }

  toggleElementFill(): void {
    if (this.selectedElement) {
      this.selectedElement.hasFill = this.selectedElement.hasFill === false;
    }
  }

  // --- GESTIÓN DE DIAPOSITIVAS ---

  previousSlide(): void {
    if (this.currentSlideIndex > 0) {
      if (this.selectedElement) this.selectedElement.selected = false;
      this.currentSlideIndex--;
      this.selectedElement = null;
      this.editingElementId = null;
    }
  }

  nextSlide(): void {
    if (this.currentSlideIndex < this.slides.length - 1) {
      if (this.selectedElement) this.selectedElement.selected = false;
      this.currentSlideIndex++;
      this.selectedElement = null;
      this.editingElementId = null;
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
    if (this.selectedElement) this.selectedElement.selected = false;
    this.currentSlideIndex = index;
    this.selectedElement = null;
    this.editingElementId = null;
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