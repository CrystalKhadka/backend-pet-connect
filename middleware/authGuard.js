const jwt = require('jsonwebtoken');
const userModel = require('../model/userModel');

const authGuard = async (req, res, next) => {
  // Check incoming data
  console.log(req.headers);

  // get authorization data from headers
  const authHeader = req.headers.authorization;

  // check or validate
  if (!authHeader) {
    return res.status(400).json({
      success: false,
      message: 'Authorization header not found',
    });
  }

  // split the data (Format: 'Bearer token) - only token
  const token = authHeader.split(' ')[1];
  // if token not found: stop the process (send res)
  if (!token || token === '') {
    return res.status(400).json({
      success: false,
      message: 'Token not found',
    });
  }
  // verify
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = decoded;

    next();
    // if verified : next(function in controller)
    // not verified : not authorized
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Not authorized',
      error: error,
    });
  }
};

const adminGuard = (req, res, next) => {
  console.log(req.headers);

  // get authorization data from headers
  const authHeader = req.headers.authorization;

  // check or validate
  if (!authHeader) {
    return res.status(400).json({
      success: false,
      message: 'Authorization header not found',
    });
  }

  // split the data (Format: 'Bearer token) - only token
  const token = authHeader.split(' ')[1];
  // if token not found: stop the process (send res)
  if (!token || token === '') {
    return res.status(400).json({
      success: false,
      message: 'Token not found',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    if (req.user.role !== 'owner') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }
    next();

    // if verified : next(function in controller)
    // not verified : not authorized
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Not authorized',
      error: error,
    });
  }
};

module.exports = {
  authGuard,
  adminGuard,
};
