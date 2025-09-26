// src/lib/palettes.ts

export type ColorScheme = {
  name: string;
  primary: string;
  secondary: string;
};

export const classicPalettes: ColorScheme[] = [
  { name: 'Default Gray', primary: '#E5E7EB', secondary: '#D1D5DB' },
  { name: 'Milky Cream', primary: '#FEFCE8', secondary: '#FDE047' },
  { name: 'Minty Turquoise', primary: '#F0FDFA', secondary: '#2DD4BF' },
  { name: 'Dusty Blue', primary: '#EFF6FF', secondary: '#60A5FA' },
];

export const modernPalettes: ColorScheme[] = [
  { name: 'Default Cyan', primary: '#0891B2', secondary: '' },
  { name: 'Bordeaux', primary: '#9F1239', secondary: '' },
  { name: 'Forest Green', primary: '#166534', secondary: '' },
  { name: 'Indigo', primary: '#4338CA', secondary: '' },
  { name: 'Graphite', primary: '#404040', secondary: '' },
];

export const creativePalettes: ColorScheme[] = [
  { name: 'Neon Violet', primary: '#8B5CF6', secondary: '' },
  { name: 'Hot Pink', primary: '#EC4899', secondary: '' },
  { name: 'Lime Green', primary: '#84CC16', secondary: '' },
  { name: 'Electric Orange', primary: '#F97316', secondary: '' },
];