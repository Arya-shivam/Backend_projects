
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({
    path:"src/.env"
})
// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloudinary = async(localfilepath)=>{
    try {
        if(!localfilepath) return null
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        //after uplaoding file on cloudinary -> delete the file
        fs.unlinkSync(localfilepath);
        return response

        console.log("File uploaded on cloudinary, File src:"+response.url)

    } catch (error) {
        fs.unlinkSync(localfilepath);
        return null
    }
} 
    