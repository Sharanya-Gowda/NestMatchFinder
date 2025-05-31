// @ts-nocheck
import { 
  users, properties, bookings, reviews, favorites, verificationDocuments, rentPayments,
  type User, type InsertUser, type Property, type InsertProperty, 
  type Booking, type InsertBooking, type Review, type InsertReview,
  type Favorite, type InsertFavorite, type VerificationDocument, type InsertVerificationDocument,
  type RentPayment, type InsertRentPayment
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Property methods
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByOwner(ownerId: number): Promise<Property[]>;
  getPropertiesByCity(city: string): Promise<Property[]>;
  getAllProperties(): Promise<Property[]>;
  searchProperties(filters: { city?: string; minRent?: number; maxRent?: number; gender?: string }): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, updates: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;

  // Booking methods
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByProperty(propertyId: number): Promise<Booking[]>;
  getBookingsByOwner(ownerId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;

  // Review methods
  getReviewsByProperty(propertyId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Favorite methods
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, propertyId: number): Promise<boolean>;

  // Verification methods
  getVerificationDocumentsByUser(userId: number): Promise<VerificationDocument[]>;
  createVerificationDocument(doc: InsertVerificationDocument): Promise<VerificationDocument>;

  // Rent payment methods (simple confirmation tracking)
  getRentPaymentsByBooking(bookingId: number): Promise<RentPayment[]>;
  getRentPaymentsByUser(userId: number): Promise<RentPayment[]>;
  getRentPaymentsByOwner(ownerId: number): Promise<RentPayment[]>;
  createRentPayment(payment: InsertRentPayment): Promise<RentPayment>;
  updateRentPaymentStatus(id: number, status: string): Promise<RentPayment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private favorites: Map<number, Favorite>;
  private verificationDocuments: Map<number, VerificationDocument>;
  private rentPayments: Map<number, RentPayment>;
  private currentUserId: number;
  private currentPropertyId: number;
  private currentBookingId: number;
  private currentReviewId: number;
  private currentFavoriteId: number;
  private currentDocId: number;
  private currentPaymentId: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.favorites = new Map();
    this.verificationDocuments = new Map();
    this.rentPayments = new Map();
    this.currentUserId = 1;
    this.currentPropertyId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    this.currentFavoriteId = 1;
    this.currentDocId = 1;
    this.currentPaymentId = 1;

    // No sample data - completely real-time system
  }



  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      phone: insertUser.phone,
      userType: insertUser.userType,
      isVerified: false,
      preferences: insertUser.preferences || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Property methods
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getPropertiesByOwner(ownerId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.ownerId === ownerId);
  }

  async getPropertiesByCity(city: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => 
      p.city.toLowerCase() === city.toLowerCase() && p.isActive
    );
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.isActive);
  }

  async searchProperties(filters: { city?: string; minRent?: number; maxRent?: number; gender?: string }): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(property => {
      if (!property.isActive) return false;
      if (filters.city && property.city.toLowerCase() !== filters.city.toLowerCase()) return false;
      if (filters.minRent && property.rent < filters.minRent) return false;
      if (filters.maxRent && property.rent > filters.maxRent) return false;
      if (filters.gender && filters.gender !== 'any' && property.gender !== 'any' && property.gender !== filters.gender) return false;
      return true;
    });
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = {
      id,
      ownerId: insertProperty.ownerId,
      name: insertProperty.name,
      description: insertProperty.description || null,
      address: insertProperty.address,
      city: insertProperty.city,
      state: insertProperty.state,
      pincode: insertProperty.pincode,
      latitude: insertProperty.latitude || null,
      longitude: insertProperty.longitude || null,
      rent: insertProperty.rent,
      securityDeposit: insertProperty.securityDeposit || null,
      totalRooms: insertProperty.totalRooms,
      totalBeds: insertProperty.totalBeds,
      availableBeds: insertProperty.availableBeds,
      gender: insertProperty.gender,
      amenities: insertProperty.amenities || null,
      images: insertProperty.images || null,
      ownerDocuments: insertProperty.ownerDocuments || null,
      isActive: insertProperty.isActive ?? true,
      isVerified: insertProperty.isVerified ?? false,
      rating: "0",
      reviewCount: 0,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    console.log(`Property created with ID ${id} for owner ${property.ownerId}`);
    return property;
  }

  async updateProperty(id: number, updates: Partial<Property>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...updates };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.userId === userId);
  }

  async getBookingsByProperty(propertyId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.propertyId === propertyId);
  }

  async getBookingsByOwner(ownerId: number): Promise<Booking[]> {
    const ownerProperties = await this.getPropertiesByOwner(ownerId);
    const propertyIds = ownerProperties.map(p => p.id);
    return Array.from(this.bookings.values()).filter(b => propertyIds.includes(b.propertyId));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      approvedDate: null,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    return this.bookings.delete(id);
  }

  // Review methods
  async getReviewsByProperty(propertyId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.propertyId === propertyId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  // Favorite methods
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(f => f.userId === userId);
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: new Date(),
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(userId: number, propertyId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      f => f.userId === userId && f.propertyId === propertyId
    );
    if (favorite) {
      this.favorites.delete(favorite.id);
      return true;
    }
    return false;
  }

  // Verification methods
  async getVerificationDocumentsByUser(userId: number): Promise<VerificationDocument[]> {
    return Array.from(this.verificationDocuments.values()).filter(d => d.userId === userId);
  }

  async createVerificationDocument(insertDoc: InsertVerificationDocument): Promise<VerificationDocument> {
    const id = this.currentDocId++;
    const doc: VerificationDocument = {
      ...insertDoc,
      id,
      status: 'pending',
      createdAt: new Date(),
    };
    this.verificationDocuments.set(id, doc);
    return doc;
  }

  // Rent payment methods
  async getRentPaymentsByBooking(bookingId: number): Promise<RentPayment[]> {
    return Array.from(this.rentPayments.values()).filter(p => p.bookingId === bookingId);
  }

  async getRentPaymentsByUser(userId: number): Promise<RentPayment[]> {
    return Array.from(this.rentPayments.values()).filter(p => p.userId === userId);
  }

  async getRentPaymentsByOwner(ownerId: number): Promise<RentPayment[]> {
    return Array.from(this.rentPayments.values()).filter(p => p.ownerId === ownerId);
  }

  async createRentPayment(insertPayment: InsertRentPayment): Promise<RentPayment> {
    const id = this.currentPaymentId++;
    const payment: RentPayment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
    };
    this.rentPayments.set(id, payment);
    return payment;
  }

  async updateRentPaymentStatus(id: number, status: string): Promise<RentPayment | undefined> {
    const payment = this.rentPayments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, status };
    this.rentPayments.set(id, updatedPayment);
    return updatedPayment;
  }
}

import { DatabaseStorage } from "./db-storage";

// Use database storage for permanent data persistence
export const storage = new DatabaseStorage();
