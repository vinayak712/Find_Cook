import { User } from "../modles/user.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const generateToken = (id, role)=>{
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};


const Signup = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const userexist = await User.findOne({ email });
        if (userexist) {
            return res.status(400).json({message:"user already Exist"})
            
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            name,
            email,
            role,
            password: hashedPassword
        });
        const token = generateToken(user._id, user.role);
         // 🔐 Store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 *1000 // 7 days
    });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message:"Invaild Password"})
        }
        const token = generateToken(user._id, user.role);

         // 🔐 Store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        })
}
        
    catch (error) {
        res.status(500).json({message:error.message})
    }
}

const logout = async(req, res) =>{
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({message:"Logged Out Successfully"})
}

export {
    login,
    Signup,
    logout
}
