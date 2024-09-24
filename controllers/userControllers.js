const userModel = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../service/sentEmailService');
const sendOtp = require('../service/sentOtp');
const { OAuth2Client } = require('google-auth-library');
const User = require('../model/userModel');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const registerUser = async (req, res) => {
  console.log(req.body);
  const {
    firstName,
    lastName,
    email,
    password,
    birthDate,
    address,
    gender,
    phone,
    role,
  } = req.body;

  // Validate
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !birthDate ||
    !address ||
    !gender ||
    !phone
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    });
  }

  try {
    const existingUser = await userModel.findOne({
      email: email,
      fromGoogle: false,
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        data: existingUser,
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomSalt);
    const newUser = new userModel({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      birthDate: birthDate,
      address: address,
      gender: gender,
      phone: phone,
      role: role,
    });

    await newUser.save();
    return res.status(201).json({
      success: true,
      message: 'User Registered Successfully!',
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const loginUser = async (req, res) => {
  console.log(req.body);

  // Destructuring the data
  const { email, password } = req.body;

  // Validate
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    });
  }

  // try catch
  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User does not exist',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Password',
      });
    }

    // generate token
    const token = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      (options = {
        expiresIn:
          Date.now() + process.env.JWT_TOKEN_EXPIRE * 24 * 60 * 60 * 1000 ||
          '1d',
      })
    );

    return res.status(201).json({
      success: true,
      message: 'User Logged In Successfully!',
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
      error: error,
    });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    return res.status(200).json({ success: true, message: 'Token is valid' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
      error: error,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = req.params.userId;
    console.log(id);
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'User Found',
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'User Found',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

const forgotPasswordByEmail = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    // sent email service
    const userEmail = req.body.email; // Assuming email is submitted via a form
    const token = generateToken(); // You need to implement generateToken() function

    // Construct reset link
    // const resetLink = `http://localhost:5000/api/user/reset?token=${token}&email=${userEmail}`;
    const resetLink = `http://192.168.18.7:5000/api/user/reset?token=${token}&email=${userEmail}`;

    // send email
    const emailSent = await sendEmail(userEmail, resetLink);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Email not sent',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent to reset password',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

const forgotPasswordByPhone = async (req, res) => {
  console.log(req.body);
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    });
  }

  try {
    const existingUser = await userModel.findOne({ phone: phone });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User does not exist',
      });
    }

    // generate token
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // update user
    await userModel.findByIdAndUpdate(existingUser._id, {
      otp: otp,
      otpExpires: otpExpires,
    });

    // send otp to phone
    const isSent = sendOtp(phone, otp);
    if (!isSent) {
      return res.status(400).json({
        success: false,
        message: 'OTP not sent',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
      error: error,
    });
  }
};

const resetPasswordByEmail = async (req, res) => {
  try {
    console.log(req.body);
    const { token, email, password } = req.body;

    // Validate
    if (!token || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all the fields',
      });
    }

    // validate token
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    // check if jwt token is valid
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // update password
      const randomSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, randomSalt);

      await userModel.findByIdAndUpdate(user._id, {
        password: hashedPassword,
      });

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully!',
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

const resetPasswordByPhone = async (req, res) => {
  const { phone, otp, password } = req.body;
  if (!phone || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    });
  }

  try {
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log(user.email);

    // verify otp
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // check if otp is expired
    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      });
    }

    // update password
    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomSalt);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

const generateToken = () => {
  return jwt.sign({ data: 'reset' }, process.env.SECRET_KEY, {
    expiresIn: '1h',
  });
};

const getToken = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.body;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    const jwtToken = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      (options = {
        expiresIn:
          Date.now() + process.env.JWT_TOKEN_EXPIRE * 24 * 60 * 60 * 1000 ||
          '1d',
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Token generated successfully!',
      token: jwtToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

const googleLogin = async (req, res) => {
  console.log(req.body);

  // Destructuring the data
  const { token } = req.body;

  // Validate
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    });
  }

  // try catch
  try {
    // verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name, picture } = ticket.getPayload();

    let user = await userModel.findOne({ email: email });

    if (!user) {
      const { password, role } = req.body;

      const randomSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, randomSalt);

      // Fetch the image from Google
      const response = await axios.get(picture, { responseType: 'stream' });

      // Set up image name and path
      const imageName = `${given_name}_${family_name}_${Date.now()}.png`;
      const imagePath = path.join(__dirname, `../public/profile/${imageName}`);

      // Ensure the directory exists
      const directoryPath = path.dirname(imagePath);
      fs.mkdirSync(directoryPath, { recursive: true });

      // Create a write stream to save the image
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      // Wait for the image to be fully saved
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      user = new userModel({
        firstName: given_name,
        lastName: family_name,
        email: email,
        password: hashedPassword,
        role: role,
        image: imageName,
        fromGoogle: true,
      });
      await user.save();
    }

    // generate token
    const jwtToken = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      (options = {
        expiresIn:
          Date.now() + process.env.JWT_TOKEN_EXPIRE * 24 * 60 * 60 * 1000 ||
          '1d',
      })
    );

    return res.status(201).json({
      success: true,
      message: 'User Logged In Successfully!',
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
      error: error,
    });
  }
};

const getUserByGoogleEmail = async (req, res) => {
  console.log(req.body);

  // Destructuring the data
  const { token } = req.body;

  // Validate
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    });
  }
  try {
    // verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    console.log(ticket);

    const { email } = ticket.getPayload();

    const user = await userModel.findOne({ email: email });

    if (user) {
      return res.status(200).json({
        success: true,
        message: 'User found',
        data: user,
      });
    }

    res.status(201).json({
      success: true,
      message: 'User not found',
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: e,
    });
  }
};

const getAllUsers = async (req, res) => {
  const id = req.user.id;
  try {
    const users = await userModel.find({ _id: { $ne: id } });
    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

const uploadImage = async (req, res) => {
  const id = req.user.id;
  console.log(req.files);
  const { image } = req.files;

  if (!image) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image',
    });
  }

  //  Upload the image
  // 1. Generate new image name
  const imageName = `${Date.now()}-${image.name}`;

  // 2. Make a upload path (/path/upload - directory)
  const imageUploadPath = path.join(
    __dirname,
    `../public/profile/${imageName}`
  );

  // Ensure the directory exists
  const directoryPath = path.dirname(imageUploadPath);
  fs.mkdirSync(directoryPath, { recursive: true });

  try {
    // 3. Move the image to the upload path
    image.mv(imageUploadPath);

    //  send image name to the user
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      image: imageName,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

// update user
const updateUser = async (req, res) => {
  const id = req.user.id;
  console.log(req.body);
  const {
    firstName,
    lastName,
    email,
    birthDate,
    gender,
    address,
    phone,
    image,
  } = req.body;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.birthDate = birthDate || user.birthDate;
    user.gender = gender;
    user.address = address || user.address;
    user.phone = phone || user.phone;
    user.image = image || user.image;

    await user.save();
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

// delete user from id
const deleteUser = async (req, res) => {
  const id = req.user.id;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    await userModel.findByIdAndDelete(user._id);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

// delete user from email
const deleteUserByEmail = async (req, res) => {
  const email = req.params.email;
  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    await userModel.findByIdAndDelete(user._id);
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};
// delete user from id
const deleteUserById = async (req, res) => {
  const id = req.user.id;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    await userModel.findByIdAndDelete(user._id);
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

const changePassword = async (req, res) => {
  console.log(req.body);
  console.log(req.user);

  const { oldPassword, newPassword } = req.body;
  const id = req.user.id;

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Password',
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, randomSalt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyUser,
  getCurrentUser,
  forgotPasswordByEmail,
  forgotPasswordByPhone,
  resetPasswordByEmail,
  resetPasswordByPhone,
  googleLogin,
  getUserByGoogleEmail,
  getToken,
  getUserById,
  getAllUsers,
  uploadImage,
  updateUser,
  deleteUser,
  deleteUserByEmail,
  changePassword,
  deleteUserById,
};
