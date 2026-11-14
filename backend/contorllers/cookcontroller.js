import CookProfile from "../modles/cookProfile.js";
import cloudinary from "../config/cloudinary.js";
import { User } from "../modles/user.js";

const saveProfile = async (req, res) => {
    try {
        const {
            cuisines, experience, location, pricePerDay, bio, availability, foodImages, profileImage
        } = req.body
        //check profile
        let profile = await CookProfile.findOne({ user: req.user.id });
        // if found then update
        if (profile) {
            if (cuisines !== undefined) profile.cuisines = cuisines;
            if (experience !== undefined) profile.experience = experience;
            if (location !== undefined) profile.location = location;
            if (pricePerDay !== undefined) profile.pricePerDay = pricePerDay;
            if (bio !== undefined) profile.bio = bio;
            if (availability !== undefined) profile.availability = availability;
            if (foodImages !== undefined) profile.foodImages = foodImages;
            if (profileImage !== undefined) profile.profileImage = profileImage;
            await profile.save();
        }
        // if not found then create new profile
        else {
            profile = await CookProfile.create({
                user: req.user.id,
                cuisines, experience, location, bio, pricePerDay, availability, foodImages: foodImages || [], profileImage: profileImage || ""
            });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

const getMyProfile = async (req, res) => {
    try {
        const profile = await CookProfile.findOne({ user: req.user.id })
            .populate("user", "name email")
            .populate("reviews.user", "name");
        if (!profile) {
            return res.status(400).json({ message: "Profile not found" });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}


const getAllCook = async (req, res) => {
    try {
        const cooks = await CookProfile.find({ availability: true })
            .populate("user", "name email")
            .populate("reviews.user", "name");
        res.json(cooks);
    } catch (error) {
        res.status(500).json({
      message: error.message
    });  
    }
}


const searchCooks = async (req, res) => {
    try {
        const { city, cuisine, maxPrice } = req.query;
        let filter = { availability: true };
        if (city) {
            filter['location.city'] = { $regex: city, $options: 'i' };
        }
        if (cuisine) {
            filter.cuisines = { $regex: cuisine, $options: 'i' };
        }
        if (maxPrice) {
            filter.pricePerDay = { $lte: Number(maxPrice) };
        }
        const cook = await CookProfile.find(filter)
            .populate("user", "name email")
            .populate("reviews.user", "name");
        res.json(cook);
    } catch (error) {
          res.status(500).json({
      message: error.message
    });
    }
}


const toogleAvailability = async (req, res) => {
    try {
        const profile = await CookProfile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({message:"Profile not found"})
        }
        profile.availability = !profile.availability;
        await profile.save();
           res.json({
      message: "Availability updated",
      availability: profile.availability
    });
    } catch (error) {
            res.status(500).json({
      message: error.message
    });

    }
}

const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const profile = await CookProfile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: "Cook profile not found" });
        }
        
        // Add review
        profile.reviews.push({
            user: req.user.id,
            rating: Number(rating),
            comment
        });
        
        // Calculate average rating
        const sum = profile.reviews.reduce((acc, item) => acc + item.rating, 0);
        profile.rating = sum / profile.reviews.length;
        
        await profile.save();
        res.status(201).json({ message: "Review added successfully", rating: profile.rating });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const uploadFoodImage = async (req, res) => {
    try {
        const { imageData, caption } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ message: "No image provided" });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(imageData, {
            folder: "findcook/food-images",
            resource_type: "auto",
        });

        const newImage = {
            url: result.secure_url,
            caption: caption || ""
        };

        const profile = await CookProfile.findOne({ user: req.user.id });
        if (profile) {
            profile.foodImages.push(newImage);
            await profile.save();
        }

        res.status(200).json(newImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const removeFoodImage = async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const profile = await CookProfile.findOne({ user: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Remove from foodImages array
        profile.foodImages = profile.foodImages.filter(img => img.url !== imageUrl);
        await profile.save();

        // Delete from Cloudinary — extract full public ID from URL
        const urlParts = imageUrl.split('/upload/');
        const publicId = urlParts[1].replace(/\.[^/.]+$/, '').replace(/^v\d+\//, '');
        await cloudinary.uploader.destroy(publicId);

        res.json({ message: "Image removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const uploadProfileImage = async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ message: "No image provided" });
        }

        const result = await cloudinary.uploader.upload(imageData, {
            folder: "findcook/profile-images",
            resource_type: "auto",
        });

        res.status(200).json({
            url: result.secure_url
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Toggle a chef's profile in the user's favorites
const toggleFavorite = async (req, res) => {
  try {
    const { cookId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    const isFav = user.favorites.includes(cookId);
    if (isFav) {
      // Remove from favorites
      user.favorites = user.favorites.filter((id) => id.toString() !== cookId);
    } else {
      // Add to favorites
      user.favorites.push(cookId);
    }

    await user.save();
    res.json({
      message: isFav ? "Removed from favorites" : "Added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get the user's list of favorite chefs (populated)
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "favorites",
      populate: { path: "user", select: "name email" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCookById = async (req, res) => {
    try {
        const { id } = req.params;
        let profile = null;

        // Try searching by CookProfile _id
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            profile = await CookProfile.findById(id)
                .populate("user", "name email")
                .populate("reviews.user", "name");
            
            // If not found by profile id, try searching by user id
            if (!profile) {
                profile = await CookProfile.findOne({ user: id })
                    .populate("user", "name email")
                    .populate("reviews.user", "name");
            }
        }

        if (!profile) {
            return res.status(404).json({ message: "Cook profile not found" });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export {
    getAllCook,
    saveProfile,
    getMyProfile,
    searchCooks,
    toogleAvailability,
    addReview,
    uploadFoodImage,
    removeFoodImage,
    uploadProfileImage,
    toggleFavorite,
    getFavorites,
    getCookById
}