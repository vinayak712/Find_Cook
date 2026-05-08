const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(401).json({ message: "Unauthorized - No User Data" });
            }
           // Check if user role is allowed
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Role '${req.user.role}' not allowed`
        });
            }
            next();
        } catch (error) {
            res.status(500).json({message:"Authorization error",error:error.message})
        }
    }
}
export default authorizeRoles;