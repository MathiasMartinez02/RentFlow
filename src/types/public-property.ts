import type { PropertyType } from "./property";

export interface PublicPropertyImage {
  id: string;
  url: string;
}

export interface PublicProperty {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  type: PropertyType;
  rent: number;
  expenses?: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  mainImage?: string;
  images: PublicPropertyImage[];
  createdAt: string;
}

export interface PublicPropertyFilters {
  city?: string;
  type?: PropertyType | "all";
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  search?: string;
}
