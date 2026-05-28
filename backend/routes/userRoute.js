import express from 'express'
import {signIn,signUp,logout, getAllUsers, updateUser,googleSignIn,facebookSignIn} from '../controllers/userController.js'
import {userDetails} from '../controllers/userDetails.js'
import authToken from '../middleware/authToken.js'
const userRouter = express.Router()

userRouter.post('/signin',signIn)
userRouter.post('/signup',signUp)
userRouter.get('/user-details',authToken,userDetails)
userRouter.post('/logout',logout)
userRouter.get('/all-users',authToken,getAllUsers)
userRouter.put('/update-user',authToken,updateUser)
userRouter.post('/google', googleSignIn);
userRouter.post('/facebook', facebookSignIn);



export default userRouter