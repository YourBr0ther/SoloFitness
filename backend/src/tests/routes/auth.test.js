const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const User = require('../../models/user.model');
const authRoutes = require('../../routes/auth.routes');

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';

// Connect to a test database
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/solofitness-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
});

// Clear database and close connection after tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Clear users collection after each test
afterEach(async () => {
  await User.deleteMany({});
});

describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('username', 'testuser');
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).not.toHaveProperty('password');
    });
    
    it('should not register a user with an existing email', async () => {
      // Create a user first
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      });
      
      // Try to register with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });
    
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
        });
      
      expect(res.statusCode).toEqual(400);
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      // Create a user first
      await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123'
      });
      
      // Login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('username', 'loginuser');
    });
    
    it('should not login with incorrect password', async () => {
      // Create a user first
      await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123'
      });
      
      // Try to login with wrong password
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });
    
    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });
  });
}); 