const router = require('express').Router();
const favoriteController = require('../controllers/favoriteController');
const { authGuard } = require('../middleware/authGuard');

router.post('/add', authGuard, favoriteController.addFavorite);
router.get('/get', authGuard, favoriteController.getFavorites);
router.delete('/delete/:petId', authGuard, favoriteController.deleteFavorite);

module.exports = router;
