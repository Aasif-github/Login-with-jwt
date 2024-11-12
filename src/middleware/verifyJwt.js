import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
    
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // console.log('authHeader',authHeader)
    console.log('jwt-->', req.cookies.jwt); 

    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    
    const token = authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            req.user = decoded.username;            
            next();
        }
    );
}

export {
    verifyJWT
}