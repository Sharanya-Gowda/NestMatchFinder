import dotenv from "dotenv";
dotenv.config();

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Database configuration for local PostgreSQL
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nestmatch_db';

console.log('Connecting to database:', databaseUrl.replace(/:[^:@]*@/, ':***@')); // Hide password in logs

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

// Auto-initialize database on startup
export async function initializeDatabase() {
  try {
    // Create all tables using raw SQL to ensure they exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        age INTEGER,
        gender VARCHAR(50),
        occupation VARCHAR(255),
        "userType" VARCHAR(50) NOT NULL,
        "isVerified" BOOLEAN DEFAULT false,
        preferences JSONB DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        "ownerId" INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        city VARCHAR(255) NOT NULL,
        state VARCHAR(255) NOT NULL,
        pincode VARCHAR(20) NOT NULL,
        latitude VARCHAR(50),
        longitude VARCHAR(50),
        rent INTEGER NOT NULL,
        "totalBeds" INTEGER NOT NULL,
        "availableBeds" INTEGER NOT NULL,
        gender VARCHAR(20) NOT NULL,
        amenities JSONB DEFAULT '[]',
        images JSONB DEFAULT '[]',
        "isVerified" BOOLEAN DEFAULT false,
        "averageRating" DECIMAL DEFAULT 0,
        "reviewCount" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("ownerId") REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "propertyId" INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        rent INTEGER NOT NULL,
        "securityDeposit" INTEGER,
        "compatibilityScore" DECIMAL,
        "requestedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "approvedDate" TIMESTAMP,
        "moveInDate" TIMESTAMP,
        "moveOutDate" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES users(id),
        FOREIGN KEY ("propertyId") REFERENCES properties(id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "propertyId" INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES users(id),
        FOREIGN KEY ("propertyId") REFERENCES properties(id)
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "propertyId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES users(id),
        FOREIGN KEY ("propertyId") REFERENCES properties(id),
        UNIQUE("userId", "propertyId")
      );

      CREATE TABLE IF NOT EXISTS verification_documents (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "documentType" VARCHAR(100) NOT NULL,
        "documentUrl" TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS rent_payments (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "propertyId" INTEGER NOT NULL,
        "bookingId" INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        "paymentMonth" VARCHAR(20) NOT NULL,
        "paymentDate" TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        "paymentMethod" VARCHAR(100),
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES users(id),
        FOREIGN KEY ("propertyId") REFERENCES properties(id),
        FOREIGN KEY ("bookingId") REFERENCES bookings(id)
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "foodType" VARCHAR(50),
        "sleepSchedule" VARCHAR(50),
        "studyHabits" VARCHAR(50),
        cleanliness VARCHAR(50),
        "socialLevel" VARCHAR(50),
        smoking VARCHAR(50),
        drinking VARCHAR(50),
        pets VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES users(id)
      );
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.log('⚠️  Database initialization skipped or failed (tables may already exist):', (error as Error).message);
  }
}