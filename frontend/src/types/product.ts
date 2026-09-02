export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag: string;
  category: string;
  stock?: number;
  isActive?: boolean;
};

export type CartItem = Product & {
  quantity: number;
};

export type CustomerForm = {
  name: string;
  phone: string;
  city: string;
  deliveryType?: string;
  paymentMethod?: string;
  notes: string;
};

export type OrderRequest = {
  clientName: string;
  phone: string;
  city: string;
  notes: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
};
