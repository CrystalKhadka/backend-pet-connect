# Pet Adoption System - Backend

## Overview

The backend for the Pet Adoption System is built with Node.js and handles
functionalities for both admin and user sides. It manages pet data, user
authentication, adoption processes, and various API endpoints for user
management, pet management, adoptions, favorites, messaging, notifications, and
payments.

## Features

### User APIs

- **POST** `/api/user/register` - User registration
- **POST** `/api/user/login` - User login
- **POST** `/api/user/forgot/email` - Forgot password by email
- **POST** `/api/user/forgot/phone` - Forgot password by phone
- **POST** `/api/user/reset/phone` - Reset password by phone
- **POST** `/api/user/google` - Google login
- **POST** `/api/user/getGoogleUser` - Get user by Google email
- **GET** `/api/user/get/:id` - Get user by ID
- **GET** `/api/user/all` - Get all users
- **GET** `/api/user/getMe` - Get the current user
- **PUT** `/api/user/update` - Update user profile
- **POST** `/api/user/upload` - Upload user profile image

### Pet APIs

- **POST** `/api/pet/add` - Add a new pet
- **GET** `/api/pet/all/:id` - View all pets by owner
- **GET** `/api/pet/get/:id` - View pet by ID
- **DELETE** `/api/pet/delete/:id` - Delete pet by ID
- **PUT** `/api/pet/update/:id` - Update pet by ID
- **GET** `/api/pet/all` - Get all pets
- **GET** `/api/pet/pagination` - Get pets with pagination
- **GET** `/api/pet/species` - Get all pet breeds
- **GET** `/api/pet/total` - Get total number of pets
- **GET** `/api/pet/filter/species` - Filter pets by species
- **PUT** `/api/pet/status/:id` - Set pet status (adopted/available)
- **GET** `/api/pet/all/adopted/:id` - Get all pets by adoption status
- **GET** `/api/pet/adopted/all` - Get all adopted pets
- **PUT** `/api/pet/set/adopted` - Set pet as adopted

### Adoption APIs

- **POST** `/api/adoption/create` - Add a new adoption request
- **GET** `/api/adoption/get/:id` - Get all adoptions for a user
- **GET** `/api/adoption/count` - Count total adoptions
- **PUT** `/api/adoption/status/:id` - Set adoption status
- **GET** `/api/adoption/form_sender` - Get adoption requests sent by the
  current user

### Favorite APIs

- **POST** `/api/favorite/add` - Add a pet to favorites
- **GET** `/api/favorite/get` - Get all favorite pets
- **DELETE** `/api/favorite/delete/:id` - Remove a pet from favorites

### Chat APIs

- **POST** `/api/messages/send` - Send a message
- **GET** `/api/messages/get/:id` - Get messages by chat ID with pagination
- **GET** `/api/messages/get_by_id/:id` - Get message by ID
- **PUT** `/api/messages/update/:id` - Update message by ID
- **DELETE** `/api/messages/delete/:id` - Delete message by ID
- **GET** `/api/messages/get` - Get chat list
- **POST** `/api/messages/send/file` - Send a file

### Notification APIs

- **GET** `/api/notifications/get` - Get notifications
- **PUT** `/api/notifications/read/:id` - Mark notification as read
- **POST** `/api/notifications/send` - Send a notification

### Payment APIs

- **POST** `/api/payment/add` - Create a payment
- **POST** `/api/khalti/initiate-payment` - Initiate a Khalti payment
- **GET** `/api/khalti/verify-payment/:token` - Verify Khalti payment
- **POST** `/api/khalti/payment` - Complete Khalti payment

## Technologies

- **Node.js** - Server-side runtime environment
- **Express.js** - Backend framework for building web applications
- **MongoDB** - NoSQL database for storing and managing data
- **Mongoose** - Object Data Modeling library for MongoDB and Node.js

## Environment Variables

- `PORT` - Port number for the server
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `KHALTI_SECRET_KEY` - Secret key for Khalti
- `KHALTI_GATEWAY_URL` - Khalti gateway URL
- `GOOGLE_CLIENT_ID` - Google client ID for OAuth

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables
4. Run the server with `npm start` or `npm run dev` for development mode

## Author

Crystal Raj Khadka
