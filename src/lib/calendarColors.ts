export interface CalendarColorOption {
  id: string;
  label: string;
  hex: string;
}

export const CALENDAR_COLORS: readonly CalendarColorOption[] = [
  { id: 'blue', label: 'Blue', hex: '#0078D4' },
  { id: 'emerald', label: 'Green', hex: '#059669' },
  { id: 'amber', label: 'Amber', hex: '#D97706' },
  { id: 'purple', label: 'Purple', hex: '#9333EA' },
  { id: 'rose', label: 'Rose', hex: '#E11D48' },
  { id: 'cyan', label: 'Cyan', hex: '#0891B2' },
  { id: 'red', label: 'Red', hex: '#EF4444' },
  { id: 'slate', label: 'Slate', hex: '#64748B' },
];

export const DEFAULT_CALENDAR_COLOR = CALENDAR_COLORS[0].hex;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const isHexColor = (value: unknown): value is string =>
  typeof value === 'string' && HEX_COLOR.test(value);

export const normalizeCalendarColor = (value: unknown): string =>
  isHexColor(value) ? value : DEFAULT_CALENDAR_COLOR;
