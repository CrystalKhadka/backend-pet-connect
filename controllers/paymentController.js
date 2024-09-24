const paymentModel = require('../model/paymentModel');
const {
  initiatePayment,
  verifyPayment,
} = require('../service/sentKhaltiResponse');
exports.addPayment = async (req, res) => {
  console.log(req.body);
  const { pet, paymentMethod, paymentAmount } = req.body;
  const user = req.user.id;
  if (!pet || !user || !paymentMethod || !paymentAmount) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide all required fields',
    });
  }
  try {
    const newPayment = await paymentModel({
      pet,
      user,
      paymentMethod,
      paymentAmount: parseInt(paymentAmount),
    });
    await newPayment.save();

    const payment = await paymentModel
      .findById(newPayment._id)
      .populate('pet')
      .populate('user')
      .populate({
        path: 'pet',

        populate: {
          path: 'adoptedBy',
          model: 'users',
        },
      })
      .populate({
        path: 'pet',

        populate: {
          path: 'createdBy',
          model: 'users',
        },
      });
    res.status(201).json({
      success: true,
      payment: payment,
      paymentMethod: paymentMethod,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// View khalti payment
exports.viewKhaltiPayment = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide token',
    });
  }
  try {
    const khaltiPayment = await verifyPayment(token);
    res.status(200).json({
      status: 'success',
      data: khaltiPayment,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
