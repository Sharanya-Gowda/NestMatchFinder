import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, signupSchema, insertBookingSchema, insertPropertySchema, insertReviewSchema, insertFavoriteSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nestmatch_secret_key";

// Extend Request interface for authenticated routes
interface AuthRequest extends Request {
  user: {
    id: number;
    email: string;
    userType: string;
  };
}

// Authentication middleware
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, userType: user.userType },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: "User created successfully",
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, userType: user.userType },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login successful",
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`User authenticated: ID ${user.id}, Email: ${user.email}, Type: ${user.userType}`);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data", error });
    }
  });

  // Property routes
  app.get("/api/properties", async (req: Request, res: Response) => {
    try {
      const { city, minRent, maxRent, gender } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      if (minRent) filters.minRent = parseInt(minRent as string);
      if (maxRent) filters.maxRent = parseInt(maxRent as string);
      if (gender) filters.gender = gender as string;

      const properties = Object.keys(filters).length > 0 
        ? await storage.searchProperties(filters)
        : await storage.getAllProperties();
      
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching properties", error });
    }
  });

  app.get("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property", error });
    }
  });

  app.post("/api/properties", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user.userType !== 'owner') {
        return res.status(403).json({ message: "Only property owners can create properties" });
      }

      const validatedData = insertPropertySchema.parse({
        ...req.body,
        ownerId: req.user.id
      });
      
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ message: "Invalid property data", error });
    }
  });

  app.get("/api/owner/:ownerId/properties", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestedOwnerId = parseInt(req.params.ownerId);
      
      if (req.user.id !== requestedOwnerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const properties = await storage.getPropertiesByOwner(requestedOwnerId);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching owner properties", error });
    }
  });

  app.put("/api/properties/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      res.json(updatedProperty);
    } catch (error) {
      res.status(400).json({ message: "Error updating property", error });
    }
  });

  app.delete("/api/properties/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteProperty(propertyId);
      if (deleted) {
        res.json({ message: "Property deleted successfully" });
      } else {
        res.status(500).json({ message: "Error deleting property" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting property", error });
    }
  });

  // Booking routes
  app.post("/api/bookings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking data", error });
    }
  });

  app.get("/api/user/:userId/bookings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestedUserId = parseInt(req.params.userId);
      
      if (req.user.id !== requestedUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await storage.getBookingsByUser(requestedUserId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user bookings", error });
    }
  });

  app.get("/api/owner/:ownerId/bookings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestedOwnerId = parseInt(req.params.ownerId);
      
      if (req.user.id !== requestedOwnerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await storage.getBookingsByOwner(requestedOwnerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching owner bookings", error });
    }
  });

  app.put("/api/bookings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const property = await storage.getProperty(booking.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Associated property not found" });
      }
      
      if (booking.userId !== req.user.id && property.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedBooking = await storage.updateBooking(bookingId, req.body);
      res.json(updatedBooking);
    } catch (error) {
      res.status(400).json({ message: "Error updating booking", error });
    }
  });

  // Review routes
  app.get("/api/properties/:propertyId/reviews", async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const reviews = await storage.getReviewsByProperty(propertyId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews", error });
    }
  });

  app.post("/api/reviews", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data", error });
    }
  });

  // Favorite routes
  app.get("/api/user/:userId/favorites", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestedUserId = parseInt(req.params.userId);
      
      if (req.user.id !== requestedUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const favorites = await storage.getFavoritesByUser(requestedUserId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Error fetching favorites", error });
    }
  });

  app.post("/api/favorites", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertFavoriteSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const favorite = await storage.createFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid favorite data", error });
    }
  });

  app.delete("/api/favorites/:userId/:propertyId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const propertyId = parseInt(req.params.propertyId);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteFavorite(userId, propertyId);
      if (deleted) {
        res.json({ message: "Favorite removed successfully" });
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error removing favorite", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}