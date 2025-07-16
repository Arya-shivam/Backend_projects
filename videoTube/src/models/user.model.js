import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({
    path:'src/.env'
})

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

UserSchema.pre("save",async function(next){
    if(!this.modified("password")) return next()

    this.password = bcrypt.hash(this.password,10);
    
    next()
})

UserSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

UserSchema.methods.generateAccessToken=function(){
    // short lived tokens
    return jwt.sign({
        _id:this._id,
        email:this.email,
        fullname:this.fullname
    },
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRY_TIME)
}

UserSchema.methods.generateRefreshToken=function(){
    // long lived tokens
    return jwt.sign({
        _id:this._id,
        email:this.email,
        fullname:this.fullname
    },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRY_TIME)
}

export const User = new mongoose.model("User",UserSchema)