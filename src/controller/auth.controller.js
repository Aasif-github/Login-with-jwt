import User from "../model/auth.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const signIn = async(req, res) => {
    
    try {
        const { email, username, password } = req.body;

        // encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const saveUserInput = {
            email,
            username,
            password: hashedPassword
        };
        
        const user = new User(saveUserInput);

        await user.save();

        res.json({
            'status': 201,
            'message':'New User Created'
        });
    } catch (error) {
        console.log(error)
    }
}

const login = async(req, res) => {
    
    try {
        // const cookies = req.cookies;
        // console.log(`cookie available at login: ${JSON.stringify(cookies)}`);
      
        const { username, password } = req.body;
        
        if(!username || !password){
            return res.sendStatus(400);
        }

        const user = await User.findOne({ username });

        if (!user) return res.sendStatus(401); //Unauthorized 

        const match = await bcrypt.compare(password, user.password);
        
        // create JWTs
        if(match) {

            const accessToken = jwt.sign(
                {                    
                    "username": user.username
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '60s'}
            );  

            const newRefreshToken = jwt.sign(
                {
                    "username": user.username                    
                },
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: '1d'}
            );                  

            //save refresh token with current user
            
            // save new refresh token into database
            user.refreshToken = newRefreshToken;    

            //user.refreshToken = [...user.refreshToken, newRefreshToken];
            const result = await user.save(); // returns updated document(return cursor)
            console.log(result);

            // Creates Secure Cookie with refresh token
            res.cookie('jwt', newRefreshToken, 
                {   
                    httpOnly: true, 
                    secure: false, 
                    sameSite: 'strict', // Change to false if testing on localhost without HTTPS
                    maxAge: 24 * 60 * 60 * 1000,
                    path: '/' // for all routes  
                }); // 1 day
        
             
            // Send authorization access token to user
            res.json({ accessToken });         
        }         
    } catch (error) {
        console.log(error)
    }
}

const refreshToken = async(req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(401);
        const refreshToken = cookies.jwt;
        
        const user = await User.findOne({ refreshToken });
        if (!user) return res.sendStatus(403); // Forbidden
        
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.sendStatus(403); //Forbidden
                const username = decoded.username;
                const accessToken = jwt.sign(
                    { "username": username },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '60s' }                    
                );
                res.json({ accessToken });            
            }
        );
    } catch (error) {
        console.log(error)
    }
}           

export {
    signIn,
    login,
    refreshToken
}