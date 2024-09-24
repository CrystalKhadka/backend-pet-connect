const favorite = require('../model/favoriteModel');

exports.addFavorite = async (req, res) => {
  console.log(req.body);
  console.log(req.user);

  // destructure
  const { petId } = req.body;
  const { id } = req.user;

  // validate
  if (!petId) {
    return res.status(400).json({ message: 'Pet ID is required' });
  }
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    //   find by pet id and user id
    const fav = await favorite.findOne({ user: id, pet: petId });
    if (fav) {
      return res.status(400).json({ message: 'Pet already in favorites' });
    }
    // create
    const newFavorite = new favorite({
      user: id,
      pet: petId,
    });
    await newFavorite.save();

    res.status(201).json({ message: 'Pet added to favorites' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await favorite
      .find({ user: req.user.id })
      .populate({
        path: 'pet',
        populate: {
          path: 'createdBy',
          model: 'users',
        },
      })
      .populate('user');
    res.status(200).json({
      success: true,
      message: 'Favorites fetched successfully',
      favorites: favorites,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteFavorite = async (req, res) => {
  const { petId } = req.params;
  const { id } = req.user;

  try {
    const fav = await favorite.findOne({ user: id, pet: petId });
    if (!fav) {
      return res.status(400).json({ message: 'Pet not in favorites' });
    }
    await favorite.findByIdAndDelete(fav._id);
    res.status(200).json({ message: 'Pet removed from favorites' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
