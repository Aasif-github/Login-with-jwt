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

// const login = async(req, res) => {
    
//     try {
//         const cookies = req.cookies;
//         console.log(`cookie available at login: ${JSON.stringify(cookies)}`);
        
//         const { username, password } = req.body;
        
//         if(!username || !password){
//             return res.send('Error- Invalid Input');
//         }

//         const user = await User.findOne({ username });
//         if (!user) return res.sendStatus(401); //Unauthorized 

//         const match = await bcrypt.compare(password, user.password);
        
//         // create JWTs
//         if(match) {

//             const accessToken = jwt.sign(
//                 {
//                     "UserInfo":{
//                         "username": user.username
//                     }
//                 },
//                 process.env.ACCESS_TOKEN_SECRET,
//                 {expiresIn: '15m'}
//             );  

//             const newRefreshToken = jwt.sign(
//                 {
//                     "UserInfo":{
//                         "username": user.username
//                     }
//                 },
//                 process.env.REFRESH_TOKEN_SECRET,
//                 {expiresIn: '1d'}
//             );                  

//              // Changed to let keyword
//             let newRefreshTokenArray =
//             !cookies?.jwt
//                 ? user.refreshToken
//                 : user.refreshToken.filter(rt => rt !== cookies.jwt);
                
//                 if (cookies?.jwt) {

//                     /* 
//                     Scenario added here: 
//                         1) User logs in but never uses RT and does not logout 
//                         2) RT is stolen
//                         3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
//                     */
//                     const refreshToken = cookies.jwt;
//                     const foundToken = await User.findOne({ refreshToken }).exec();
        
//                     // Detected refresh token reuse!
//                     if (!foundToken) {
//                         console.log('attempted refresh token reuse at login!')
//                         // clear out ALL previous refresh tokens
//                         newRefreshTokenArray = [];
//                     }
        
//                     res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
//                 }

//                 // Saving refreshToken with current user
//                 user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
//                 const result = await user.save();
//                 console.log(result);                

//                 // Creates Secure Cookie with refresh token
//                 res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

//                 // Send authorization access token to user
//                 res.json({ accessToken });         
//         }         
//     } catch (error) {
//         console.log(error)
//     }
// }

export {
    signIn,
    login
}