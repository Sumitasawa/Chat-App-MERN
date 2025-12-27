import mongoose from "mongoose"

export const db=async()=>{
    try{
            mongoose.connection.on('connected',()=>{})

            await mongoose.connect(`${process.env.MONGO_URI}/chat-app`)
    }catch(error){
        console.log(error);

    }

}