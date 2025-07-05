import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        username:{
            type:String,
            unique:true,
            lowercase:true,
            required:true,
            index:true,
            trim:true
        },
        email:{
            type:String,
            unique:true,
            lowercase:true,
            required:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String, // URl
            required:true,
        },
        coverImg:{
            type:String, // URl
            required:true,
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true,"password is required"], // error msg if not entered 
            unique:true
        },
        refreshToken:{
            type:String,
        }
    },
    {timestamps:true}
)

export const User = new mongoose.model("User",UserSchema)