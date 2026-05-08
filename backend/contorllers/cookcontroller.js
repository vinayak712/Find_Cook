import CookProfile from "../modles/cookProfile.js";
import cloudinary from "../config/cloudinary.js";

const saveProfile = async (req, res) => {
    try {
        const {
            cuisines, experience, location, pricePerDay, bio, availability, foodImages
        } = req.body
        //check profile
        let profile = await CookProfile.findOne({ user: req.user.id });
        // if found then update
        if (profile) {
            profile.cuisines = cuisines;
            profile.experience = experience;
            profile.location = location;
            profile.pricePerDay = pricePerDay;
            profile.bio = bio;
            if (availability !== undefined) profile.availability = availability;
            if (foodImages) profile.foodImages = foodImages;
            await profile.save();
        }
        // if not found then create new profile
        else {
            profile = await CookProfile.create({
                user: req.user.id,
                cuisines, experience, location, bio, pricePerDay, availability, foodImages: foodImages || []
            });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

const getMyProfile = async (req, res) => {
    try {
        const profile = await CookProfile.findOne({ user: req.user.id }).populate("user", "name email");
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
        const cooks = await CookProfile.find({ availability: true }).populate("user", "name email");
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
            filter.pricePerDay = { $lte: maxPrice };
        }
        const cook = await CookProfile.find(filter).populate("user", "name email");
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

        res.status(200).json({
            url: result.secure_url,
            caption: caption || ""
        });
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

        // Delete from Cloudinary
        const publicId = imageUrl.split('/').pop().split('.')[0];
        const folderPath = "findcook/food-images";
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);

        res.json({ message: "Image removed successfully" });
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
    removeFoodImage
}