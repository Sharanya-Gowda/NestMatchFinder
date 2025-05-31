// @ts-nocheck
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  name: text("name"), // Full name for display
  phone: text("phone").notNull(),
  age: integer("age"),
  gender: text("gender"), // 'male', 'female', 'other'
  occupation: text("occupation"),
  userType: text("user_type").notNull(), // 'user' or 'owner'
  isVerified: boolean("is_verified").default(false),
  preferences: jsonb("preferences"), // lifestyle preferences for compatibility
  createdAt: timestamp("created_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  rent: integer("rent").notNull(),
  totalBeds: integer("total_beds").notNull(),
  availableBeds: integer("available_beds").notNull(),
  gender: text("gender").notNull(), // 'male', 'female', 'any'
  amenities: jsonb("amenities").notNull(),
  images: jsonb("images"),
  ownerDocuments: jsonb("owner_documents"), // Aadhar, license, etc.
  totalRooms: integer("total_rooms").notNull(),
  securityDeposit: integer("security_deposit"),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  status: text("status").notNull(), // 'pending', 'approved', 'rejected', 'active', 'completed'
  compatibilityScore: integer("compatibility_score"),
  requestedDate: timestamp("requested_date"),
  approvedDate: timestamp("approved_date"),
  moveInDate: timestamp("move_in_date"),
  moveOutDate: timestamp("move_out_date"),
  rent: integer("rent").notNull(),
  securityDeposit: integer("security_deposit"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentType: text("document_type").notNull(), // 'aadhar', 'pg_license'
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const rentPayments = pgTable("rent_payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  amount: integer("amount").notNull(),
  paymentMonth: text("payment_month").notNull(), // Format: "2024-01"
  paymentDate: timestamp("payment_date").notNull(),
  status: text("status").notNull(), // 'paid', 'pending', 'overdue'
  paymentMethod: text("payment_method").default("manual"), // 'manual', 'online', 'cash'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  foodType: text("food_type").notNull(),
  sleepSchedule: text("sleep_schedule").notNull(),
  studyHabits: text("study_habits").notNull(),
  cleanliness: text("cleanliness").notNull(),
  socialLevel: text("social_level").notNull(),
  smoking: text("smoking").notNull(),
  drinking: text("drinking").notNull(),
  pets: text("pets").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
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
  updatedAt: true,
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
