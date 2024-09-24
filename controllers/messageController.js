const messageModel = require('../model/messageModel');
const { getIo, users } = require('../service/socketService'); // Import the socket service
const fs = require('fs');
const path = require('path');
// Create a new message
createMessage = async (req, res) => {
  console.log(req.body);
  const { message, type } = req.body;
  const sender = req.user.id;
  const receiver = req.body.receiver._id ?? req.body.receiver;

  // Validate
  if (!message || !receiver) {
    return res.status(400).json({
      message: 'Please enter all fields',
      success: false,
    });
  }

  try {
    const newMessage = new messageModel({
      message: message,
      sender: sender,
      receiver: receiver,
      type: type,
      timestamp: new Date(),
    });

    await newMessage.save();
    const messageWithUsers = await messageModel
      .findById(newMessage._id)
      .populate('sender')
      .populate('receiver');

    // Print the message with users
    console.log(messageWithUsers);

    const io = getIo(); // Get the initialized io instance

    // emit message
    io.to(users[sender]).to(users[receiver]).emit('message', messageWithUsers);

    if (receiver && users[receiver]) {
      io.to(users[receiver]).emit('sended', messageWithUsers);
    } else {
      io.emit('sended', messageWithUsers); // Broadcast if no specific receiver
    }

    res.status(200).json({
      message: 'Message sent successfully',
      success: true,
      newMessage: messageWithUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
      error,
      success: false,
    });
  }
};

// Get all messages
getAllMessages = async (req, res) => {
  console.log(req.params.id);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;

  try {
    const messages = await messageModel
      .find({
        $or: [
          { sender: req.user.id, receiver: req.params.id },
          { sender: req.params.id, receiver: req.user.id },
        ],
      })
      .populate('sender')
      .populate('receiver')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      messages: messages,
      success: true,
      message: 'Messages fetched successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
      error,
      success: false,
    });
  }
};

const getMessageById = async (req, res) => {
  try {
    const message = await messageModel.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        message: 'Message not found',
        success: false,
      });
    }
    const io = getIo();
    io.emit('sended', message);
    res.status(200).json({
      message: message,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
      error,
      success: false,
    });
  }
};

const saveFile = async (req, res) => {
  console.log(req.files);
  var type = 'file';
  if (!req.files) {
    return res.status(400).json({
      message: 'Please upload a file',
      success: false,
    });
  }

  const { file } = req.files;
  // generate file name
  const fileName = `${Date.now()}_${file.name}`;

  try {
    // Validate file type if type=image, set type to image and save image in '../public/messages/images'
    if (file.mimetype.includes('image')) {
      const filePath = path.join(
        __dirname,
        '../public/messages/images',
        fileName
      );
      // Ensure the directory exists
      const directoryPath = path.dirname(filePath);
      fs.mkdirSync(directoryPath, { recursive: true });
      file.mv(filePath);
      type = 'image';
    } else {
      // move file to uploads directory
      const filePath = path.join(
        __dirname,
        '../public/messages/files',
        fileName
      );
      // Ensure the directory exists
      const directoryPath = path.dirname(filePath);
      fs.mkdirSync(directoryPath, { recursive: true });
      file.mv(filePath);
      type = 'file';
    }

    res.status(200).json({
      message: 'File uploaded successfully',
      success: true,
      file: fileName,
      type: type,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
      error,
      success: false,
    });
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  saveFile,
};
