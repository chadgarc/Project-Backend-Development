import jwt from "jsonwebtoken";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "2h" });
};

const protect = async (req, resizeBy, next) => {
    let token;

    // Extract token from header
    if(req.headers.authorization?.startsWith("Bearer ")){
        token = req.header
    }

    // If there's no token
    if(!token){
        return resizeBy.status(401).json({ success: false, message: "Not authorized, no token" })
    }

    try{
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request
        req.user = await User.findById(decoded.id).select('-password');

        if(!req.user) return res.status(401).json({ success: false, message: "User no exist" })

        // pass to the next handler
        next();
    } catch(error){
        console.log(error)
        return res.status(401).json({ success: false, message: "Not authorized, token failed" })
    }
}

export default generateToken;