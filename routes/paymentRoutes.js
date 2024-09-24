const router = require('express').Router();

const paymentController = require('../controllers/paymentController');
const { authGuard } = require('../middleware/authGuard');

router.post('/add', authGuard, paymentController.addPayment);
router.post('/khalti', paymentController.viewKhaltiPayment);

module.exports = router;
