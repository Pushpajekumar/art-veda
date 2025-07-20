type SkiaRenderable =
  | {
    type: 'text';
    id: string;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    fill: string;
    label: string;
  }
  | { 
    type: 'image'; 
    id: string; 
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    src: string; 
    label: string; 
    scaleX?: number;
    scaleY?: number;
  };