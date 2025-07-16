import { asyncHandler } from "../utils/asyncHandler";

const registerUser = asyncHandler(async(req,res)=>{
    const {fullname,username,email,password}=req.body;

    

})

export {registerUser}