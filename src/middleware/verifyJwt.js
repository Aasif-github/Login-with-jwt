import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
    
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    //console.log('jwt-->', req.cookies.jwt);  // refresh-token

    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    
    const token = authHeader.split(' ')[1];
    console.log('token::',token);
    console.log(`----------------------------------`);
    console.log('authHeader', JSON.stringify(authHeader))
    
    
    
    

    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); // Forbidden
            req.user = decoded.username;            
            next();
        }
    );
}

export {
    verifyJWT
}