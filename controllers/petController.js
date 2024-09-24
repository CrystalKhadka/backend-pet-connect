const petModel = require('../model/petModel');
const path = require('path');
const fs = require('fs');
const { count } = require('console');

exports.addPet = async (req, res) => {
  // Get data from request
  console.log(req.body);

  // Destructuring the data
  const {
    petName,
    petSpecies,
    petBreed,
    petAge,
    petColor,
    petWeight,
    petDescription,
  } = req.body;

  const petOwner = req.user.id;
  // Validate
  if (
    !petName ||
    !petSpecies ||
    !petBreed ||
    !petAge ||
    !petColor ||
    !petWeight ||
    !petDescription
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    });
  }

  var imageName = null;
  try {
    // Validating the image
    if (req.files && req.files.petImage) {
      const { petImage } = req.files;
      //  Upload the image
      // 1. Generate new image name
      imageName = `${Date.now()}-${petImage.name}`;

      // 2. Make a upload path (/path/upload - directory)
      const imageUploadPath = path.join(
        __dirname,
        `../public/pets/${imageName}`
      );

      // 3. Move the image to the path
      await petImage.mv(imageUploadPath);
    }

    // Save the data to database
    const newPet = new petModel({
      petName: petName,
      petSpecies: petSpecies,
      petBreed: petBreed,
      petAge: petAge,
      petColor: petColor,
      petWeight: petWeight,
      createdBy: petOwner,
      petDescription: petDescription,
      petImage: imageName,
    });

    await newPet.save();
    return res.status(201).json({
      success: true,
      message: 'Pet Added Successfully!',
      data: newPet,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

exports.getAllPets = async (req, res) => {
  try {
    const allPets = (await petModel.find({})).populate('createdBy');
    return res.status(200).json({
      success: true,
      message: 'All Pets',
      pets: allPets,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

exports.getAllPetsByOwner = async (req, res) => {
  try {
    const petOwner = req.params.ownerId;
    console.log(petOwner);
    const allPets = await petModel.find({ createdBy: petOwner });
    return res.status(201).json({
      success: true,
      message: 'All Pets',
      pets: allPets,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

// Delete a pet
exports.deletePet = async (req, res) => {
  try {
    const petId = req.params.petId;
    const pet = await petModel.findById(petId);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }

    if (pet.petImage) {
      // Delete the image
      const imagePath = path.join(__dirname, `../public/pets/${pet.petImage}`);
      fs.unlinkSync(imagePath);
    }

    await petModel.findByIdAndDelete(petId);
    return res.status(200).json({
      success: true,
      message: 'Pet deleted successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

exports.getPetById = async (req, res) => {
  try {
    const petId = req.params.petId;
    const pet = await petModel.findById(petId).populate('createdBy');
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Pet found',
      data: pet,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

// Update pets
exports.updatePet = async (req, res) => {
  console.log(req.body);
  try {
    const pet = petModel.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
    }
    // If there is image
    if (req.files && req.files.petImage) {
      //  Destructure the image
      const { petImage } = req.files;

      // Upload image to /public/image
      // 1. Generate new image name
      const imageName = `${Date.now()}-${petImage.name}`;

      // 2. Make a upload path (/path/upload - directory)
      const imageUploadPath = path.join(
        __dirname,
        `../public/pets/${imageName}`
      );

      // 3. Move the image to the path
      await petImage.mv(imageUploadPath);

      // Update the data
      req.body.petImage = imageName;

      // Delete the previous image
      if (req.body.petImage) {
        const existingPet = await petModel.findById(req.params.petId);
        const imagePath = path.join(
          __dirname,
          `../public/pets/${existingPet.petImage}`
        );
        console.log(imagePath);
        fs.unlinkSync(imagePath);
      }
    }
    // Update the data
    const updatedPet = await petModel.findByIdAndUpdate(
      req.params.petId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Pet Updated Successfully!',
      data: updatedPet,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

exports.pagination = async (req, res) => {
  try {
    deleteUnwantedImages();
    const page = req.query.page || 0;
    const limit = req.query.limit || 4;

    const pets = await petModel
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy');

    if (pets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pets not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pets fetched successfully',
      pets: pets,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

const deleteUnwantedImages = async () => {
  try {
    const images = await getAllImages();
    const imagesFromFolder = await this.getImageFromFolder();
    imagesFromFolder.forEach((image) => {
      if (!images.includes(image)) {
        fs.unlinkSync(path.join(__dirname, '../public/pets', image));
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllImages = async () => {
  try {
    const images = await petModel.find({}).distinct('petImage');
    return images;
  } catch (error) {
    console.log(error);
    return [];
  }
};

exports.getImageFromFolder = async () => {
  try {
    const images = await fs.readdirSync(path.join(__dirname, '../public/pets'));
    return images;
  } catch (error) {
    console.log(error);
    return [];
  }
};

exports.searchPetsWithPagination = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 4;
    const search = req.query.search || '';

    // include the search inside the petName
    const pets = await petModel
      .find({
        petName: {
          $regex: search,
          $options: 'i',
        },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('createdBy')
      .exec();

    if (pets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Pets not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pets fetched successfully',
      pets: pets,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

exports.totalPets = async (req, res) => {
  species = req.query.species || null;
  search = req.query.search || '';
  if (species === 'all') {
    species = null;
  }
  try {
    const totalPets = await petModel
      .find({
        ...(species && { petSpecies: species }),
      })
      .find({
        petBreed: {
          $regex: search,
          $options: 'i',
        },
      })
      .countDocuments();
    return res.status(200).json({
      success: true,
      message: 'Total Pets',
      totalPets: totalPets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

exports.getAllSpecies = async (req, res) => {
  try {
    const species = await petModel.find({}).distinct('petSpecies');
    return res.status(200).json({
      success: true,
      message: 'All Species',
      species: species,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

exports.getPetBySpecies = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 4;
  const species = req.query.species == 'all' ? null : req.query.species || null;
  const search = req.query.search || '';
  try {
    const pets = await petModel
      .find({
        // if species is null, return all pets
        ...(species && {
          petSpecies: species,
        }),
      })
      .find({
        petBreed: {
          $regex: search,
          $options: 'i',
        },
        adoptedBy: null,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy');
    return res.status(200).json({
      success: true,
      message: `Pets Fetched`,
      pets: pets,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

exports.setPetStatus = async (req, res) => {
  try {
    console.log(req.body);
    const id = req.params.petId;

    const { status } = req.body;
    const pet = await petModel.findByIdAndUpdate(id, { petStatus: status });
    return res.status(200).json({
      success: true,
      message: 'Pet status updated',
      data: pet,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

exports.getAllAdoptedPets = async (req, res) => {
  try {
    const ownerId = req.user.id;
    console.log(ownerId);
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    const pets = await petModel
      .find({
        petStatus: 'adopted',
        createdBy: ownerId,
      })
      .populate('adoptedBy');
    res.status(200).json({
      success: true,
      message: 'All adoptions',
      pets: pets,
      count: pets.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error,
    });
  }
};

exports.setPetAdopted = async (req, res) => {
  console.log(req.body);
  const { petId, userId } = req.body;
  if (!petId || !userId) {
    return res.status(400).json({
      success: false,
      message: 'Pet not found',
    });
  }
  try {
    const pet = await petModel.findById(petId);
    if (!pet) {
      return res.status(400).json({
        success: false,
        message: 'Pet not found',
      });
    }

    pet.petStatus = 'adopted';
    pet.adoptedBy = userId;

    await pet.save();

    res.status(200).json({
      success: true,
      message: 'Pet adopted successfully',
      data: pet,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error,
    });
  }
};

// delete by pet name
exports.deletePetByName = async (req, res) => {
  try {
    const petName = req.params.petName;
    const pet = await petModel.find({ petName: petName });
    if (!pet) {
      return res.status(400).json({
        success: false,
        message: 'Pet not found',
      });
    }

    pet.forEach(async (pet) => {
      await petModel.findByIdAndDelete(pet._id);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};

exports.countPet = async (req, res) => {
  const field = req.params.cat;
  try {
    const petSpecies = await petModel.aggregate([
      {
        $group: {
          _id: '$' + field,
          count: { $sum: 1 },
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      message: 'Count of pets by ' + field,
      data: petSpecies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};
