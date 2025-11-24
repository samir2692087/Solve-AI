
import React from 'react';

export enum InputMode {
  TEXT = 'TEXT',
  CALCULATOR = 'CALCULATOR',
  IMAGE = 'IMAGE',
  DRAW = 'DRAW',
  UNIT_CONVERTER = 'UNIT_CONVERTER',
  EMI_CALCULATOR = 'EMI_CALCULATOR',
  AGE_CALCULATOR = 'AGE_CALCULATOR',
  GST_CALCULATOR = 'GST_CALCULATOR',
  CURRENCY_CONVERTER = 'CURRENCY_CONVERTER',
  HISTORY = 'HISTORY',
  ABOUT = 'ABOUT',
  PRIVACY = 'PRIVACY'
}

export type ThemeId = 'classic' | 'ocean' | 'forest' | 'sunset' | 'monochrome';

export interface GraphPoint {
  x: number;
  y: number;
  label?: string;
}

export interface GraphData {
  functions: string[];
  points?: GraphPoint[];
  xDomain?: [number, number];
  yDomain?: [number, number];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string; // Base64 string
  timestamp: number;
  isError?: boolean;
  graphData?: GraphData;
}

export interface CalculatorButton {
  label: string | React.ReactNode;
  value: string;
  type: 'number' | 'operator' | 'function' | 'action' | 'control';
  
  // Advanced Calculator Features
  shiftLabel?: string | React.ReactNode;
  shiftValue?: string;
  alphaLabel?: string | React.ReactNode;
  alphaValue?: string;
  
  // Visual Styling
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'warning' | 'dark';
  span?: number; // Col span
}