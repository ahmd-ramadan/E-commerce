const User = require('../../../database/models/User.js');
const Vendor = require('../../../database/models/Vendor.js');
const Request = require('../../../database/models/Request.js');


const asyncHandler = require('../../middlewares/asyncHandler.js');
const {
    GeneratePassword, 
    GenerateSalt, 
    ValidatePassword, 
    GenerateSignature,
    generateUniqueString,
    ValidateSignature2
} = require('../../utils/index.js');
const {sendEmail} = require('../../utils/sendEmail.js');
const {systemRequests, systemRoles, systemRequestsStatus} = require('../../utils/systemValues.js');



const userCtrl = {
    getUserProfile: asyncHandler(
        async (req, res, next) => {
            //! Get _id from authUser And find it
            const { _id } = req.authUser;
            const user = await User.findById(_id);
            if(user.role == systemRoles.VENDOR) {
                user = await Vendor.findOne({userId: _id}).populate({
                    path: "userId",
                    model: "User",
                });
            }
            res.status(200).json({ 
                success: true, 
                data: user, 
                message: "",
            });
        }
    ),

    updateUserProfile: asyncHandler(
        async (req, res, next) => {
            //! Get the request body & _id from authUser
            const {name, email, phoneNumbers, addresses} = req.body;
            const { _id } = req.authUser;
            
            //! Get user
            const user = await User.findById(_id);

            //! Check if the user want to update the email field
            if (email !== user.email) {
                const newEmailExist = await User.findOne({ email });
                if (newEmailExist) {
                    return next( new Error("Email already exists,Please try another email", { status: 409}));
                }
                
                //! Create Token
                const token = await GenerateSignature({
                    email: email,
                    id: newUser._id
                });

                //! Activate User
                const activationLink = `${req.protocol}://${req.headers.host}/verify-email/?token=${token}`;
                // console.log(activationLink);
                const isEmailSent = await sendEmail({
                    to: email,
                    subject: 'Account Activation',
                    linkTo: activationLink,
                    fileName: "activate-email.ejs",
                });
                if (!isEmailSent) {
                    return next(new Error('Fail to sent email to activate!', {status: 400}));
                } 
                user.isEmailVerified = false;
                user.isLoggedIn = false;
                user.email = email;
            }
            user.name = name;
            user.phoneNumbers = phoneNumbers;
            user.addresses = addresses;

            //! Save user in database
            await user.save();
            
            //! Send response
            res.status(200).json({
                success: true,
                data: user,
                message: "User Infromation Updated Successfully!",
            });
        }
    ),

    deleteUser: asyncHandler(
        async (req, res, next) => {
            //! Get role & _id from the request authUser & userId from query
            const { role, _id } = req.authUser;
            const { userId } = req.query;
            
            userId = (role == systemRoles.USER || role == systemRoles.ADMIN || role == systemRoles.VENDOR ? _id : userId)
            
            //! Delete user
            const user = await User.findById(userId);
            const deletedUser = await User.findByIdAndDelete(userId);
            if(!deletedUser) {
                return next(new Error("Deleted Account Failed, Try Again", { status: 400 }));
            }
            if(user.role == systemRoles.VENDOR) {
                await Vendor.findOneAndDelete({userId});
            }

            //! Send respnse
            res.status(200).json({ 
                success: true, 
                data: null,
                message: "User Deleted successfully!" 
            });
        }
    ),

    softDeleteUser: asyncHandler(
        async (req, res, next) => {
            //! Get role & _id from the request authUser & userId from query
            const { role, _id } = req.authUser;
            const { userId } = req.query;
            
            userId = (role == systemRoles.USER || role == systemRoles.ADMIN ? _id : userId);
            
            //! Delete user
            const user = await User.findById(userId);
            const deletedUser = await User.findByIdAndUpdate(userId, {isDeleted: true});
            if(!deletedUser) {
                return next(new Error("Deleted Account Failed, Try Again", { status: 400 }));
            }
            if(user.role == systemRoles.VENDOR) {
                await Vendor.findOneAndUpdate({userId});
            }

            //! Send respnse
            res.status(200).json({ 
                success: true, 
                data: null,
                message: "User Deleted successfully!" 
            });
        }
    )
};

module.exports = userCtrl;