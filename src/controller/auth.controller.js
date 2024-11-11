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
        const { username, password } = req.body;
        
        if(!username || !password){
            return res.send('Error- Invalid Input');
        }

        const user = await User.findOne({ username });
        if (!user) return res.sendStatus(401); //Unauthorized 
        
        const match = await bcrypt.compare(password, user.password);

        if(match) {
            //login

        }

        console.log('user-data',user.username, user.password);

        res.json({
            'status': 200,
            'message':'Login successfully',
            'data': user
        });
        console.log('login..')
    } catch (error) {
        console.log(error)
    }
}

export {
    signIn,
    login
}