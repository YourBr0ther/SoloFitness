require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Exercise = require('./models/Exercise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
});

// API Routes
app.get('/api/exercises/:userId', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const exercise = await Exercise.findOne({
            userId: req.params.userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (!exercise) {
            // Create new exercise record for today if none exists
            const newExercise = new Exercise({
                userId: req.params.userId
            });
            await newExercise.save();
            return res.json(newExercise);
        }

        res.json(exercise);
    } catch (error) {
        console.error('Error fetching exercise data:', error);
        res.status(500).json({ error: 'Failed to fetch exercise data' });
    }
});

app.put('/api/exercises/:userId', async (req, res) => {
    try {
        const { exerciseType, count } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const exercise = await Exercise.findOneAndUpdate(
            {
                userId: req.params.userId,
                date: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            },
            {
                $set: {
                    [`${exerciseType}.count`]: count
                }
            },
            { new: true, upsert: true }
        );

        // Calculate and update XP
        const xp = exercise.calculateXP();
        exercise.xp = xp;
        await exercise.save();

        res.json(exercise);
    } catch (error) {
        console.error('Error updating exercise data:', error);
        res.status(500).json({ error: 'Failed to update exercise data' });
    }
});

// History endpoint
app.get('/api/history/:userId', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const history = await Exercise.find({
            userId: req.params.userId,
            date: { $gte: startDate }
        }).sort({ date: -1 });

        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        status: 'ok',
        database: dbStatus,
        uptime: process.uptime()
    });
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer(); 