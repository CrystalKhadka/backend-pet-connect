const router = require('express').Router();

const notificationController = require('../controllers/notificationController');
const { authGuard } = require('../middleware/authGuard');

router.post('/send', notificationController.createNotification);
router.get('/get', authGuard, notificationController.getNotifications);
router.put('/markAsRead', authGuard, notificationController.markAsRead);

module.exports = router;
