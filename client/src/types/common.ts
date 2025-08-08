export interface Price {
  value: number;
  symbol: string;
  isDefault: 0 | 1;
}

export interface Guarantee {
  start: string;
  end: string;
}