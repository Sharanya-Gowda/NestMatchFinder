// @ts-nocheck
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  name: text("name"), // Full name for display
  phone: text("phone").notNull(),
  age: integer("age"),
  gender: text("gender"), // 'male', 'female', 'other'
  occupation: text("occupation"),
  userType: text("userType").notNull(), // 'user' or 'owner'
  isVerified: boolean("isVerified").default(false),
  preferences: jsonb("preferences"), // lifestyle preferences for compatibility
  createdAt: timestamp("createdAt").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  ownerId: integer("ownerId").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  rent: integer("rent").notNull(),
  totalBeds: integer("totalBeds").notNull(),
  availableBeds: integer("availableBeds").notNull(),
  gender: text("gender").notNull(), // 'male', 'female', 'any'
  amenities: jsonb("amenities").notNull(),
  images: jsonb("images"),
  isVerified: boolean("isVerified").default(false),
  averageRating: decimal("averageRating").default("0"),
  reviewCount: integer("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  propertyId: integer("propertyId").notNull(),
  status: text("status").notNull(), // 'pending', 'approved', 'rejected', 'active', 'completed'
  compatibilityScore: decimal("compatibilityScore"),
  requestedDate: timestamp("requestedDate"),
  approvedDate: timestamp("approvedDate"),
  moveInDate: timestamp("moveInDate"),
  moveOutDate: timestamp("moveOutDate"),
  rent: integer("rent").notNull(),
  securityDeposit: integer("securityDeposit"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  propertyId: integer("propertyId").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  propertyId: integer("propertyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  documentType: text("documentType").notNull(), // 'aadhar', 'pg_license'
  documentUrl: text("documentUrl").notNull(),
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("createdAt").defaultNow(),
});

export const rentPayments = pgTable("rent_payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("bookingId").notNull(),
  userId: integer("userId").notNull(),
  propertyId: integer("propertyId").notNull(),
  amount: integer("amount").notNull(),
  paymentMonth: text("paymentMonth").notNull(), // Format: "2024-01"
  paymentDate: timestamp("paymentDate").notNull(),
  status: text("status").notNull(), // 'paid', 'pending', 'overdue'
  paymentMethod: text("paymentMethod").default("manual"), // 'manual', 'online', 'cash'
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  foodType: text("foodType").notNull(),
  sleepSchedule: text("sleepSchedule").notNull(),
  studyHabits: text("studyHabits").notNull(),
  cleanliness: text("cleanliness").notNull(),
  socialLevel: text("socialLevel").notNull(),
  smoking: text("smoking").notNull(),
  drinking: text("drinking").notNull(),
  pets: text("pets").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  averageRating: true,
  reviewCount: true,
}).extend({
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  approvedDate: true,
}).extend({
  moveInDate: z.string().transform((str) => new Date(str)).or(z.date()),
  moveOutDate: z.string().transform((str) => new Date(str)).or(z.date()),
  requestedDate: z.string().transform((str) => new Date(str)).or(z.date()),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertRentPaymentSchema = createInsertSchema(rentPayments).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = z.infer<typeof insertVerificationDocumentSchema>;
export type RentPayment = typeof rentPayments.$inferSelect;
export type InsertRentPayment = z.infer<typeof insertRentPaymentSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.enum(['user', 'owner']),
});

export const signupSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;