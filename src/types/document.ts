export interface LineItem {
  id: string;
  position: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Customer {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Company {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  taxId: string;
  vatId: string;
  bankName: string;
  iban: string;
  bic: string;
  registerCourt: string;
  registerNumber: string;
  manager: string;
}

export interface DocumentData {
  id: string;
  type: 'invoice' | 'quote';
  documentNumber: string;
  date: string;
  dueDate?: string;
  customer: Customer;
  company: Company;
  lineItems: LineItem[];
  isSmallBusiness: boolean;
  notes: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  createdAt: string;
}