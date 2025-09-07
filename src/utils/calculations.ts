import { LineItem } from '../types/document';

export const calculateLineTotal = (quantity: number, unitPrice: number): number => {
  return Math.round(quantity * unitPrice * 100) / 100;
};

export const calculateSubtotal = (lineItems: LineItem[]): number => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  return Math.round(subtotal * 100) / 100;
};

export const calculateVat = (subtotal: number, isSmallBusiness: boolean): number => {
  if (isSmallBusiness) return 0;
  return Math.round(subtotal * 0.19 * 100) / 100;
};

export const calculateTotal = (subtotal: number, vatAmount: number): number => {
  return Math.round((subtotal + vatAmount) * 100) / 100;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('de-DE').format(new Date(date));
};