import mongoose from "mongoose";

const dbConnection = async() => {
    try {

        const localConnectionString = `mongodb://localhost:27017/login-with-jwt`;
        const mongoDBConn = mongoose.connect(localConnectionString);    
        
        if(mongoDBConn){
            return mongoDBConn;
        }
        return false;
    } catch (error) {
        console.log(error);
    }
}

export { dbConnection };