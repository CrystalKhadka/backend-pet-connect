const router = require('express').Router();
const messageController = require('../controllers/messageController');
const { authGuard } = require('../middleware/authGuard');

router.post('/send', authGuard, messageController.createMessage);
router.get('/get/:id', authGuard, messageController.getAllMessages);
router.get('/get_by_id/:id', authGuard, messageController.getMessageById);
router.post('/send/file', messageController.saveFile);

module.exports = router;
