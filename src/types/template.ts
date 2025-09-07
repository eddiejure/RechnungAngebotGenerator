export interface LineItemTemplate {
  id: string;
  description: string;
  unitPrice: number;
  category: string;
  createdAt: string;
}

export interface CompanyTemplate {
  id: string;
  name: string;
  company: {
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
  };
  isDefault: boolean;
  createdAt: string;
}