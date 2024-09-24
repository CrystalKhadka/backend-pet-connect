const Adoption = require('../model/adoptionModel');
const mongoose = require('mongoose');

exports.createAdoption = async (req, res) => {
  console.log(req.body);

  const { formReceiver, pet, form } = req.body;
  const formSender = req.user.id;

  console.log({ formReceiver, pet, form });

  if (!pet || !form || !formReceiver) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    });
  }

  try {
    const adoptionExists = await Adoption.findOne({
      formSender: formSender,
      pet: pet,
      status: 'pending',
    });

    if (adoptionExists) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested for this pet',
      });
    }

    const adoption = await Adoption.create({
      formSender: formSender,
      pet: pet,
      form: form,
      formReceiver: formReceiver,
    });

    return res.status(201).json({
      success: true,
      message: 'Adoption created successfully',
      data: adoption,
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

exports.countByUniquePet = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  try {
    var adoptions = await Adoption.aggregate([
      {
        $group: {
          _id: '$pet',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'pets',
          localField: '_id',
          foreignField: '_id',
          as: 'pet',
        },
      },
      {
        $unwind: '$pet',
      },
      {
        $match: {
          'pet.createdBy': new mongoose.Types.ObjectId(userId),
          'pet.petStatus': { $ne: 'adopted' },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: 'All adoptions',
      count: adoptions.length,
      adoptions: adoptions,
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

exports.countPetAdoptionsByOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    const adoptions = await Adoption.find({
      formReceiver: userId,
    });

    return res.status(200).json({
      success: true,
      message: 'All adoptions',
      count: adoptions.length,
      data: adoptions,
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

exports.getAdoptionsByPet = async (req, res) => {
  try {
    const petId = req.params.petId;
    console.log(petId);
    const adoptions = await Adoption.find({
      pet: petId,
    })
      .populate('formSender')
      .populate('formReceiver')
      .populate('pet');

    // Put Adopted pet first
    adoptions.sort((a, b) => {
      if (a.status !== 'adopted') {
        return -1;
      } else {
        return 1;
      }
    });

    return res.status(200).json({
      success: true,
      message: 'All adoptions',
      count: adoptions.length,
      adoption: adoptions,
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

exports.setAdoptionStatus = async (req, res) => {
  try {
    const adoptionId = req.params.adoptionId;
    const status = req.body.status;

    const adoption = await Adoption.findByIdAndUpdate(
      adoptionId,
      { status: status },
      { new: true }
    );

    // Auto reject other requests
    if (status === 'approved') {
      await Adoption.updateMany(
        {
          pet: adoption.pet,
          _id: { $ne: adoptionId },
        },
        { status: 'rejected' }
      );
    }
    res.status(200).json({
      success: true,
      message: 'Adoption status updated',
      data: adoption,
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

// get adopted by form sender
exports.getAdoptionsByFormSender = async (req, res) => {
  try {
    const formSender = req.user.id;
    const adoptions = await Adoption.find({
      formSender: formSender,
    })
      .populate('formSender')
      .populate('formReceiver')
      .populate('pet')
      .populate({
        path: 'pet',
        populate: {
          path: 'createdBy',
          model: 'users',
        },
      });

    return res.status(200).json({
      success: true,
      message: 'All adoptions',
      count: adoptions.length,
      adoption: adoptions,
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
