export interface ProductImage {
  id: number;
  src: string;
  alt: string;
  thumbnail: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  regularPrice: number;
  onSale: boolean;
  rating: number;
  reviewCount: number;
  category: string;
  categoryName: string;
  brand: string;
  images: ProductImage[];
  image: string;
  salt?: string;
  dosage?: string;
  manufacturer: string;
  prescriptionRequired: boolean;
  packSize: string;
  storage: string;
  howToUse: string;
  sideEffects: string[];
  benefits: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
