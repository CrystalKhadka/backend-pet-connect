const express = require('express');
const dotenv = require('dotenv');
const { connectDatabase } = require('./database/database');
const cors = require('cors');
const acceptFormData = require('express-fileupload');
const bodyParser = require('body-parser');
const http = require('http');
const { initSocket } = require('./service/socketService'); // Import the socket service
const { URL } = require('url');

// Initialize app
const app = express();

// Express Json Config
app.use(express.json());

// dotenv Configuration
dotenv.config();

// Connecting to database
connectDatabase();

// cors configuration
const corsOptions = {
  origin: {
    test: ['http://localhost:3000', 'http://192.168.137.1:3000'],
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Accepting form data
app.use(acceptFormData());

// Middleware to parse the body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set ejs as view engine
app.set('view engine', 'ejs');

// Set public route
app.use(express.static('public'));

// Test api
app.get('/test', (req, res) => {
  res.send('Test API is Working!....');
});

app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/pet', require('./routes/petRoutes'));
app.use('/api/adoption', require('./routes/adoptionRoutes'));
app.use('/api/favorite', require('./routes/favoriteRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/khalti', require('./routes/khaltiRoutes'));

// Defining the port
const PORT = process.env.PORT || 5000;

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
initSocket(server); // Initialize Socket.io

// Socket.io connection

// Starting the server (always at the last)
server.listen(PORT, () => {
  console.log(`Server started at port ${PORT} and URL is ${process.env.URL}`);
});

module.exports = app;
