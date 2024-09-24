// Description: Routes for user related functionalities.
const router = require('express').Router();
const { authGuard, adminGuard } = require('../middleware/authGuard');

const petController = require('../controllers/petController');

router.post('/add', adminGuard, petController.addPet);
router.get('/all', petController.getAllPets);
router.get('/all/:ownerId', petController.getAllPetsByOwner);
router.delete('/delete/:petId', adminGuard, petController.deletePet);
router.get('/get/:petId', authGuard, petController.getPetById);
router.put('/update/:petId', adminGuard, petController.updatePet);
router.get('/total', petController.totalPets);
router.get('/pagination', petController.pagination);
router.get('/species', petController.getAllSpecies);
router.get('/search', petController.searchPetsWithPagination);
router.get('/filter/species', petController.getPetBySpecies);
router.put('/status/:petId', petController.setPetStatus);
router.get('/adopted/all', adminGuard, petController.getAllAdoptedPets);
router.put('/set/adopted', adminGuard, petController.setPetAdopted);
router.get('/count/:cat', petController.countPet);

router.delete(
  '/delete_name/:petName',
  adminGuard,
  petController.deletePetByName
);
module.exports = router;
