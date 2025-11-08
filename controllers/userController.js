import User from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const TOKEN_EXPIRES = '48h';

const createToken = (userId) => jwt.sign({id: userId},
                                        JWT_SECRET,
                                        {expiresIn: TOKEN_EXPIRES});

//SIGN UP
export async function registerUser(req, res) {
    const {name, email, password} = req.body

    if(!name || !email || !password) {
        return res
        .status(400)
        .json({success: false,
               message: "All credentials are required"
        })
    }
    if(!validator.isEmail(email)) {
        return res
        .status(400)
        .json({success: false,
               message: "Invalid Email"
        })
    }
    if(password.length < 8) {
        return res
        .status(400)
        .json({success: false,
               message: "Password must be atleast 8 characters"
        })
    }
    try{
        if(await User.findOne({email})) {
            return res
            .status(500)
            .json({success: false,
                   message: "User already exists"
            })
        }
        const hashed = await bcrypt.hash(password,10)
        const user = await User.create({name, email, password: hashed}); 
        const token = createToken(user._id);
        res 
        .status(200)
        .json({
            success: true,
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }
        })

    } catch(error) {
        console.log(error);
        res
        .status(500)
        .json({
            success: false,
            message: "Server error"
        })
    }
}

//LOG IN
export async function loginUser( req,res) {
    const {email, password} = req.body;
    if(!email || !password) {
        return res
        .status(400)
        .json({
            success: false,
            message:"Email and password required"
        })
    }
    try {
        const user = await User.findOne({email})
        if(!user) {
            return res
            .status(401)
            .json({success: false, 
                message: "Invalid credentials"
            })
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match) {
            return res
            .status(401)
            .json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const token = createToken(user._id)
        res
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email}})

    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({
            success: false,
            message: "Server error"
        })
    }
}

//GET USER
export async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user.id).select("name email");
        if(!user) {
            return res
            .status(401)
            .json({
                success: false,
                message: "User does not exist"
            })
        }
        res
        .json({
            success: true,
            user
        })

    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({
            success: false,
            message: "Server error"
        })
    }
}

//UPDATE USER
export async function updateProfile(req, res) {
    const {name, email} = req.body;
    if(!name || !email || !validator.isEmail(email)) {
        return res
        .status(401)
        .json({
            success: false,
            message: "Valid email and name required"
        })
    }
    try {
        const exists = await User.findOne({email, _id: { $ne: req.user.id }})
        if (exists) {
            return res
            .status(401)
            .json({
                success: false,
                message: "Email in use by other account"
            })
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {name, email},
            {new: true,
             runValidators: true,
             select: "name email"
            }
        )
        res
        .json({
            success: true, 
            user
        })

    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({
            success: false,
            message: "Server error"
        })
    }
}

//RESET PASSWORD
export async function updatePassword(req, res) {
    const {currentPassword, newPassword} = req.body
    if(!currentPassword || !newPassword || newPassword.length < 8) {
        return res
        .status(401)
        .json({
            success: false,
            message: "Password invalid"
        })
    }
    try {
        const user = await User.findById(req.user.id).select("password")
        if(!user) {
            return res
            .status(401)
            .json({
                success: false,
                message: "User not applicable"
            })
        }
        const match  = await bcrypt.compare(currentPassword, user.password);
        if(!match){
            return res
            .status(401)
            .json({
                success: false,
                message: "Password does not matchh"
            })
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res
        .json({
            success: true,
            message: "Password converted"
        })
    } catch (error) {
                console.log(error);
        res
        .status(500)
        .json({
            success: false,
            message: "Server error"
        })
    }
}
