import jwt from 'jsonwebtoken'
const auth = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({message:"Not Authorized"})
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        res.status(401).json({message:"Invaild Token"})
    }
}
export default auth;