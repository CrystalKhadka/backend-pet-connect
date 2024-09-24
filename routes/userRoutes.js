const userController = require('../controllers/userControllers');
const { authGuard } = require('../middleware/authGuard');
const router = require('express').Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/verify', authGuard, userController.verifyUser);
router.get('/getMe', authGuard, userController.getCurrentUser);
router.post('/getToken', userController.getToken);
router.post('/forgot/email', userController.forgotPasswordByEmail);
router.post('/forgot/phone', userController.forgotPasswordByPhone);
// Route to render password reset form
router.get('/reset', (req, res) => {
  res.render('reset-form');
});
// Route to handle password reset
router.post('/reset/email', userController.resetPasswordByEmail);
router.post('/reset/phone', userController.resetPasswordByPhone);

// Route to handle google login
router.post('/google', userController.googleLogin);
router.post('/getGoogleUser', userController.getUserByGoogleEmail);

// Get User by Id
router.get('/get/:userId', userController.getUserById);

// Get all users
router.get('/all', authGuard, userController.getAllUsers);

// upload image
router.post('/upload', authGuard, userController.uploadImage);

// update user
router.put('/update', authGuard, userController.updateUser);

// delete user
router.delete('/delete', authGuard, userController.deleteUser);

// delete user from email
router.delete('/delete/:email', userController.deleteUserByEmail);

// delete user from id
router.delete('/delete', userController.deleteUserById);

// change password
router.put('/change_password', authGuard, userController.changePassword);

module.exports = router;
