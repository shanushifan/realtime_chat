import UserModel from "../models/Auth.js"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
export const Register = async (req, res) => {
    try {
      const { name, email, password, mobile } = req.body; // Added 'mobile' field
  
      // Check if all required fields are present
      if (!name || !email || !password || !mobile || !req.file) {
        return res.status(400).json({
          success: false,
          message: `${
            !name
              ? "Name"
              : !email
              ? "Email"
              : !password
              ? "Password"
              : !mobile
              ? "Mobile number"
              : !req.file
              ? "Profile is required"
              : ""
          } is required`,
        });
      }
  
      console.log("req.file", req.file);
  
      // Check if the user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
  
      // Construct image path
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const imagePath = `${baseUrl}/images/${req.file.filename}`;
  
      // Hash the password
      const hashedPassword = await bcryptjs.hash(password, 10);
  
      // Create a new user
      const newUser = new UserModel({
        name,
        email,
        password: hashedPassword,
        mobile, // Added mobile number field
        profile: imagePath,
      });
  
      // Save user to database
      await newUser.save();
  
      res.status(200).json({ success: true, message: "User registered successfully", user: newUser });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  


export const Login=async(req, res)=>{
    try {
        const {email, password}=req.body
        if(!email || !password){
            return res.status(400).json({success:false, message:"Email and password are required"})
        }
        const user=await UserModel.findOne({email})
        if(!user){
            return res.status(400).json({success:false, message:"User does not exist please register"})
        }
        const isMatch=await bcryptjs.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({success:false, message:"Invalid credentials"})
        }
        const token=jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:"1d"})
        res.status(200).json({success:true, message:"User logged in successfully", user,token})
    } catch (error) {
        res.status(500).json({success:false, message:error.message})
    }
}

 export const GetUser=async(req, res)=>{
    try {
        const user=await UserModel.find()
        res.status(200).json({success:true, message:"User fetched successfully", user})
    } catch (error) {
        res.status(500).json({success:false, message:error.message})
    }
}