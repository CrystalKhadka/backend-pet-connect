const khaltiModel = require('../model/khaltiModel');
const {
  initiatePayment,
  verifyPayment,
} = require('../service/sentKhaltiResponse');

// initialize khalti payment
exports.initiateKhaltiPayment = async (req, res) => {
  console.log(req.body);
  const payment = req.body.payment;
  const website_url = req.body.website_url || 'http://localhost:3000';
  const return_url =
    req.body.return_url || 'http://localhost:3000/payment-success';

  try {
    const response = await initiatePayment(payment, return_url, website_url);
    if (response.data.payment_url) {
      res.status(200).json({
        status: 'success',
        data: response.data,
        pidx: response.data.pidx,
        payment_url: response.data.payment_url,
      });
    } else {
      res.status(400).json({
        success: false,
        message: response,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const { token } = req.params;
  try {
    const response = await verifyPayment(token);
    res.status(200).json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.khaltiPayment = async (req, res) => {
  console.log(req.body);
  const {
    amount,
    purchase_order_id,
    purchase_order_name,
    status,
    transactionId,
    extra,
  } = req.body;

  // validate
  if (
    !amount ||
    !purchase_order_id ||
    !purchase_order_name ||
    !status ||
    !transactionId
  ) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }
  try {
    //   find by transactionId
    const paymentExist = await khaltiModel.findOne({ transactionId });
    if (paymentExist) {
      return res.status(400).json({ msg: 'Payment already exist' });
    }

    const payment = await khaltiModel.create({
      amount,
      purchase_order_id,
      purchase_order_name,
      status,
      transactionId,
      extra,
    });
    res.status(201).json({
      status: 'success',
      data: {
        payment,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
