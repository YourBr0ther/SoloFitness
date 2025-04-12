# SoloFitness Backend

This is the backend API for the SoloFitness application, providing authentication, data storage, and business logic for the fitness tracking and gamification features.

## Tech Stack

- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM (Object Document Mapper)
- **JWT**: Authentication

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB Atlas account (or local MongoDB installation)
- npm or yarn

### Installation

1. Clone the repository if you haven't already
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Create a `.env` file in the root of the backend directory (use `.env.example` as a template)
5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<your-connection-string>
JWT_SECRET=your_secret_key
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:3000
```

## API Documentation

### Authentication

#### Register a new user
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "username",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: User data with JWT token

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: User data with JWT token

### User Management

#### Get user profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Auth**: Required
- **Response**: User profile data

#### Update user profile
- **URL**: `/api/users/profile`
- **Method**: `PUT`
- **Auth**: Required
- **Body**:
  ```json
  {
    "username": "newUsername",
    "email": "newemail@example.com"
  }
  ```
- **Response**: Updated user data

#### Get user progress
- **URL**: `/api/users/progress`
- **Method**: `GET`
- **Auth**: Required
- **Response**: User level and XP data

### Exercise Tracking

#### Create exercise entry
- **URL**: `/api/exercises`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  {
    "type": "pushup",
    "sets": 3,
    "reps": 15,
    "duration": 20
  }
  ```
- **Response**: Created exercise with XP earned

#### Get all exercises
- **URL**: `/api/exercises`
- **Method**: `GET`
- **Auth**: Required
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Entries per page (default: 10)
  - `type`: Filter by exercise type
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
- **Response**: List of exercises with pagination

#### Get exercise by ID
- **URL**: `/api/exercises/:id`
- **Method**: `GET`
- **Auth**: Required
- **Response**: Exercise details

#### Update exercise
- **URL**: `/api/exercises/:id`
- **Method**: `PUT`
- **Auth**: Required
- **Response**: Updated exercise with XP adjustment

#### Delete exercise
- **URL**: `/api/exercises/:id`
- **Method**: `DELETE`
- **Auth**: Required
- **Response**: Success message with XP adjustment

### Coach Interaction

#### Get chat history
- **URL**: `/api/coach/chat`
- **Method**: `GET`
- **Auth**: Required
- **Query Params**:
  - `limit`: Max messages to return (default: 20)
- **Response**: Coach chat history

#### Send message to coach
- **URL**: `/api/coach/chat`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  {
    "message": "How can I improve my workout routine?"
  }
  ```
- **Response**: Updated chat with coach response

#### Update coach preferences
- **URL**: `/api/coach/preferences`
- **Method**: `PUT`
- **Auth**: Required
- **Body**:
  ```json
  {
    "coachType": "motivational"
  }
  ```
- **Response**: Updated coach preferences

## Data Models

### User
- username (String)
- email (String)
- password (String, hashed)
- level (Number)
- xp (Number)
- resetPasswordToken (String)
- resetPasswordExpires (Date)

### Exercise
- user (ObjectId, ref: User)
- type (String: pushup, situp, squat, running, other)
- duration (Number, minutes)
- sets (Number)
- reps (Number)
- distance (Number, meters)
- calories (Number)
- notes (String)
- xpEarned (Number)
- completed (Boolean)

### Chat
- user (ObjectId, ref: User)
- messages (Array of message objects)
  - sender (String: user, coach)
  - content (String)
  - timestamp (Date)
- coachType (String: motivational, technical, nutrition, general)
- lastInteraction (Date)

## License

This project is licensed under the MIT License. 