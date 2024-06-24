const User = require('../../../database/models/User.js');
const Vendor = require('../../../database/models/Vendor.js');
const Request = require('../../../database/models/Request.js');

const {generateToken} = require('../../utils/auth.js');
const {sendEmail} = require('../../utils/sendEmail.js');
const {systemRoles, systemRequestsStatus} = require('../../utils/systemValues.js');

const userCtrl = {
    getUserProfile:
        async (req, res, next) => {
            //! Get _id from authUser And find it
            const { _id } = req.authUser;
            let user = await User.findById(_id);
            if(user.role == systemRoles.VENDOR) {
                user = await Vendor.findOne({user: _id}).populate({
                    path: "user",
                    model: "User",
                });
            }
            res.status(200).json({ 
                success: true, 
                data: user, 
                message: "",
            });
        },

    updateUserProfile:
        async (req, res, next) => {
            //! Get the request body & _id from authUser
            const {
                name, email, phoneNumbers, addresses,
            } = req.body;
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
                const token = await generateToken({
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
            
            // //! check is a Vendor
            // if(user.role === systemRoles.VENDOR) {
            //     const vendor = await Vendor.findOne({user: user._id});
            // }

            //! Save user in database
            await user.save();

            //! Send response
            res.status(200).json({
                success: true,
                data: user,
                message: "User Infromation Updated Successfully!",
            });
        },

    deleteUser:
        async (req, res, next) => {
            //! Get role & _id from the request authUser & userId from query
            const { role, _id } = req.authUser;
            let { userId } = req.query;
            
            //! If Super_Admin Delete User(query) / else Delete User(authUser) 
            if(role != systemRoles.SUPER_ADMIN) userId = _id;
            
            //! Delete user
            const user = await User.findById(userId);
            const deletedUser = await User.findByIdAndDelete(userId);
            if(!deletedUser) {
                return next(new Error("Deleted Account Failed, Try Again", { status: 400 }));
            }
            if(user.role == systemRoles.VENDOR) {
                await Vendor.findOneAndDelete({user: userId});
            }

            //! Send respnse
            res.status(200).json({ 
                success: true, 
                data: null,
                message: "User Deleted successfully!" 
            });
        },

    softDeleteUser:
        async (req, res, next) => {
            //! Get role & _id from the request authUser & userId from query
            const { role, _id } = req.authUser;
            const { userId } = req.query;
            
            //! If Super_Admin Delete User(query) / else Delete User(authUser) 
            if(role != systemRoles.SUPER_ADMIN) userId = _id;
            
            //! Delete user
            const user = await User.findById(userId);
            const deletedUser = await User.findByIdAndUpdate(userId, {isDeleted: true});
            if(!deletedUser) {
                return next(new Error("Deleted Account Failed, Try Again", { status: 400 }));
            }
            if(user.role == systemRoles.VENDOR) {
                await Vendor.findOneAndUpdate({user: userId}, {isApproved: false});
            }

            //! Send respnse
            res.status(200).json({ 
                success: true, 
                data: null,
                message: "User Deleted successfully!" 
            });
        },

    vendorHandleRequest:
        async(req, res, next) => {
            const {requestId, status} = req.body;
            const adminRequest = await Request.findById(requestId).populate({
                path: "data",
                model: "Vendor",
                select: "isApproved"
            });

            // console.log(adminRequest);

            if (!adminRequest) {
                return next(new Error('Request not found', { status: 404}));
            }

            //! Update the request status
            adminRequest.status = status;
            await adminRequest.save();

            //! Update the vendor approval status
            if (status === systemRequestsStatus.APPROVED) {
                adminRequest.data.isApproved = true;
                await adminRequest.data.save();
            }
            
            await Request.deleteOne({_id: adminRequest._id});

            //! Send response
            res.status(200).json({ 
                success: true,
                data: null,
                message: `Vendor request ${status}` 
            });
        },
};

module.exports = userCtrl;