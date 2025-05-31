import { MemStorage } from '../storage';
import { InsertUser, InsertProperty, InsertBooking } from '@shared/schema';

describe('Storage Tests', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('User Operations', () => {
    test('should create and retrieve user', async () => {
      const userData: InsertUser = {
        email: 'test@example.com',
        userType: 'tenant',
        name: 'Test User',
        phone: '1234567890'
      };

      const user = await storage.createUser(userData);
      expect(user.email).toBe(userData.email);
      expect(user.id).toBeDefined();

      const retrievedUser = await storage.getUser(user.id);
      expect(retrievedUser?.email).toBe(userData.email);
    });

    test('should find user by email', async () => {
      const userData: InsertUser = {
        email: 'unique@example.com',
        userType: 'owner',
        name: 'Owner User',
        phone: '9876543210'
      };

      await storage.createUser(userData);
      const foundUser = await storage.getUserByEmail('unique@example.com');
      expect(foundUser?.email).toBe('unique@example.com');
    });

    test('should update user', async () => {
      const userData: InsertUser = {
        email: 'update@example.com',
        userType: 'tenant',
        name: 'Original Name',
        phone: '1111111111'
      };

      const user = await storage.createUser(userData);
      const updatedUser = await storage.updateUser(user.id, { name: 'Updated Name' });
      expect(updatedUser?.name).toBe('Updated Name');
    });
  });

  describe('Property Operations', () => {
    test('should create and retrieve property', async () => {
      const propertyData: InsertProperty = {
        ownerId: 1,
        name: 'Test Property',
        description: 'A test property',
        address: '123 Test St',
        city: 'Test City',
        rent: 5000,
        gender: 'any',
        totalBeds: 4,
        availableBeds: 2
      };

      const property = await storage.createProperty(propertyData);
      expect(property.name).toBe(propertyData.name);
      expect(property.id).toBeDefined();

      const retrievedProperty = await storage.getProperty(property.id);
      expect(retrievedProperty?.name).toBe(propertyData.name);
    });

    test('should get properties by owner', async () => {
      const ownerId = 1;
      const propertyData: InsertProperty = {
        ownerId,
        name: 'Owner Property',
        description: 'Property owned by specific owner',
        address: '456 Owner St',
        city: 'Owner City',
        rent: 6000,
        gender: 'male',
        totalBeds: 3,
        availableBeds: 1
      };

      await storage.createProperty(propertyData);
      const properties = await storage.getPropertiesByOwner(ownerId);
      expect(properties.length).toBeGreaterThan(0);
      expect(properties[0].ownerId).toBe(ownerId);
    });

    test('should search properties by filters', async () => {
      const propertyData: InsertProperty = {
        ownerId: 1,
        name: 'Searchable Property',
        description: 'A property for search testing',
        address: '789 Search St',
        city: 'Search City',
        rent: 7000,
        gender: 'female',
        totalBeds: 2,
        availableBeds: 1
      };

      await storage.createProperty(propertyData);
      const results = await storage.searchProperties({ 
        city: 'Search City', 
        minRent: 5000, 
        maxRent: 8000 
      });
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].city).toBe('Search City');
    });
  });

  describe('Booking Operations', () => {
    test('should create and retrieve booking', async () => {
      const bookingData: InsertBooking = {
        userId: 1,
        propertyId: 1,
        checkInDate: new Date('2024-01-01'),
        checkOutDate: new Date('2024-12-31'),
        status: 'pending'
      };

      const booking = await storage.createBooking(bookingData);
      expect(booking.userId).toBe(bookingData.userId);
      expect(booking.id).toBeDefined();

      const retrievedBooking = await storage.getBooking(booking.id);
      expect(retrievedBooking?.userId).toBe(bookingData.userId);
    });

    test('should get bookings by user', async () => {
      const userId = 1;
      const bookingData: InsertBooking = {
        userId,
        propertyId: 1,
        checkInDate: new Date('2024-02-01'),
        checkOutDate: new Date('2024-11-30'),
        status: 'confirmed'
      };

      await storage.createBooking(bookingData);
      const bookings = await storage.getBookingsByUser(userId);
      expect(bookings.length).toBeGreaterThan(0);
      expect(bookings[0].userId).toBe(userId);
    });

    test('should update booking status', async () => {
      const bookingData: InsertBooking = {
        userId: 1,
        propertyId: 1,
        checkInDate: new Date('2024-03-01'),
        checkOutDate: new Date('2024-10-31'),
        status: 'pending'
      };

      const booking = await storage.createBooking(bookingData);
      const updatedBooking = await storage.updateBooking(booking.id, { status: 'confirmed' });
      expect(updatedBooking?.status).toBe('confirmed');
    });
  });
});