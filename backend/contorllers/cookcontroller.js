import CookProfile from "../modles/cookProfile";

const saveProfile = async (req, res) => {
    try {
        const {
            cuisines,  experience,location,pricePerDay,bio
        } = req.body()
        //check profile
        let profile = await CookProfile.findOne({ user: req.user });
        // if found then update
        if (profile) {
            profile.cuisines = cuisines;
            profile.experience = experience;
            profile.location = location;
            profile.pricePerDay = pricePerDay;
            profile.bio = bio;
            await profile.save();
        }
        // if not found then create new profile
        else {
            profile = await CookProfile.create({
                user: req.user.id,
                cuisines, experience, location, bio, pricePerDay
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
            filter['location city'] = city;
        }
        if (cuisine) {
            filter.cuisines=cuisine
        }
        if (maxPrice) {
            filter.pricePerDay={$lte:maxPrice}
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

export { saveProfile, searchCooks, toogleAvailability, getAllCook, getMyProfile };