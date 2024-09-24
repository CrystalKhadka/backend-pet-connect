const router = require('express').Router();

const adoptionController = require('../controllers/adoptionController');
const { authGuard, adminGuard } = require('../middleware/authGuard');

router.post('/create', authGuard, adoptionController.createAdoption);
router.get('/get/:petId', adoptionController.getAdoptionsByPet);
router.get('/count', adminGuard, adoptionController.countByUniquePet);
router.put(
  '/status/:adoptionId',
  adminGuard,
  adoptionController.setAdoptionStatus
);

router.get(
  '/form_sender',
  authGuard,
  adoptionController.getAdoptionsByFormSender
);

module.exports = router;
