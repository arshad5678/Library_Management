require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Library Management API Running"
  });
});

// Catch-all 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Centralized Global Error Handler Middleware
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5000;

// Connect to Database and Start Server
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


