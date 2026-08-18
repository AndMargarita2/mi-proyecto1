export interface Slide {
  id: number;
  elements: SlideElement[];
  /** Color de fondo de la diapositiva (lienzo). */
  backgroundColor?: string;
}

export interface LastPresentationMeta {
  title: string;
  path: string;
  at: string;
}

export interface SlideElement {
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
