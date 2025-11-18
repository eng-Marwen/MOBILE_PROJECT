export interface Gallery {
  image: string;
  _id?: string;
}

export interface Agent {
  name: string;
  email: string;
  avatar: string;
  _id: string;
}

export interface Review {
  avatar: string;
  name: string;
  review: string;
  _id: string;
}

export interface Property {
  _id: string;
  image?: string;
  images?: string[];
  rating?: number;
  name: string;
  address: string;
  price?: number;
  regularPrice?: number;
  discountedPrice?: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  description?: string;
  facilities?: string[];
  furnished?: boolean;
  parking?: boolean;
  offer?: boolean;
  gallery?: Gallery[];
  reviews?: Review[];
  agent?: Agent;
  userRef?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  username?: string;
  password?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  // Add these optional fields based on your backend user model
  address?: string;
  phone?: string;
}
