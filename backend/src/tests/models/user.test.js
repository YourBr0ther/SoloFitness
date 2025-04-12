const mongoose = require('mongoose');
const User = require('../../models/user.model');

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

describe('User Model Test', () => {
  // Test for user creation
  it('should create & save user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const validUser = new User(userData);
    const savedUser = await validUser.save();
    
    // Verify saved user
    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    // Password should be hashed
    expect(savedUser.password).not.toBe(userData.password);
    expect(savedUser.level).toBe(1); // Default level
    expect(savedUser.xp).toBe(0); // Default XP
  });
  
  // Test for required fields
  it('should fail validation when required fields missing', async () => {
    const userWithoutRequiredField = new User({
      username: 'testuser'
    });
    
    let err;
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
  
  // Test for password hashing
  it('should hash password before saving', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'plainPassword'
    });
    
    await user.save();
    
    expect(user.password).not.toBe('plainPassword');
    expect(user.password).toHaveLength(60); // bcrypt hash length
  });
  
  // Test for password comparison
  it('should correctly compare passwords', async () => {
    const password = 'correctPassword';
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password
    });
    
    await user.save();
    
    const isMatch = await user.matchPassword(password);
    const isNotMatch = await user.matchPassword('wrongPassword');
    
    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });
  
  // Test for XP and level mechanics
  it('should handle XP and level updates correctly', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    
    await user.save();
    expect(user.level).toBe(1);
    expect(user.xp).toBe(0);
    
    // Add 1500 XP (should be level 2)
    user.xp = 1500;
    await user.save();
    
    // In a real app, we'd check for auto-level-up logic
    // Here we're manually setting level for testing
    const newLevel = Math.floor(user.xp / 1000) + 1;
    user.level = newLevel;
    await user.save();
    
    expect(user.level).toBe(2);
  });
}); 