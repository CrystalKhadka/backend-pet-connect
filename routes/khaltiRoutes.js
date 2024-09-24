const router = require('express').Router();

const {
  initiateKhaltiPayment,
  khaltiPayment,
  verifyPayment,
} = require('../controllers/khaltiController');

router.post('/initiate-payment', initiateKhaltiPayment);
router.post('/payment', khaltiPayment);
router.get('/verify-payment/:token', verifyPayment);

module.exports = router;
