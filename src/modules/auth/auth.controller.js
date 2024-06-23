const User = require('../../../database/models/User.js');
const Vendor = require('../../../database/models/Vendor.js');
const Request = require('../../../database/models/Request.js');
const TemporaryUser = require('../../../database/models/TemporaryUser.js');

const {
    generatePassword, 
    generateSalt, 
    validatePassword, 
    generateToken,
    generateUniqueString,
    validateToken
} = require('../../utils/auth.js');
const {sendEmail} = require('../../utils/sendEmail.js');
const {systemRequests, systemRoles, systemRequestsStatus} = require('../../utils/systemValues.js');

const authCtrl = {
    signUp:
        async(req, res, next) => {
            //! Check Fields
            const { name, email, password, phoneNumber} = req.body;
            if(!name || !email || !password || !phoneNumber) {
                return next(new Error('Pleasse all fields are required', {status: 400}));
            }

            //! User Exist ?
            const userExist = await User.findOne({email});
            if(userExist) {
                return next(new Error('User already existed', {status: 400}));
            }
            
            //! Hashed password
            const salt = await generateSalt();
            const hashedPassword = await generatePassword(password, salt);
            

            //! Save TemporaryUser in database
            const activationCode = generateUniqueString();
            const newTempUser = await TemporaryUser.create({
                name, 
                email, 
                password: hashedPassword, 
                phoneNumber: phoneNumber,
                role: systemRoles.USER,
                activationCode,
            });

            //! Activate User
            const activationLink = `${req.protocol}://${req.headers.host}/verify-email/?code=${activationCode}`;
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

            /////////////////////////// cart here ////////////////////////////////////

            //! Send Response
            res.status(200).json({
                success: true,
                data: newTempUser,
                message: `Account Created Succefully ... Please Check Your Email To Activate Acount`,
            });
        },

    vendorSignUp:
        async (req, res, next) => {
            //! Check Fields
            const {
                name, email, password, phoneNumber,
                factoryName, factoryAddress, taxNumber,
                tradeMark, websiteLink, instagramLink, facebookLink
            } = req.body;
            if(!name || !email || !password || !phoneNumber || !factoryName || !factoryAddress || !taxNumber) {
                return next(new Error('Pleasse all fields are required', {status: 400}));
            }

            //! User Exist ?
            const userExist = await User.findOne({email});
            if(userExist) {
                return next(new Error('User already existed', {status: 400}));
            }
            
            //! Hashed password
            const salt = await generateSalt();
            const hashedPassword = await generatePassword(password, salt);
            
            //! Save Temporary User in database
            const activationCode = generateUniqueString();
            const newTempUser = await TemporaryUser.create({
                name, 
                email, 
                password: hashedPassword, 
                phoneNumber: phoneNumber,
                role: systemRoles.VENDOR,
                activationCode,
                factoryName, 
                factoryAddress, 
                taxNumber,
                tradeMark: tradeMark || "", 
                websiteLink: websiteLink | "", 
                instagramLink: instagramLink || "", 
                facebookLink: facebookLink || ""
            });

            //! Activate User
            const activationLink = `${req.protocol}://${req.headers.host}/verify-email/?code=${activationCode}`;
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

            //! Send Response
            res.status(200).json({
                success: true,
                data: null,
                message: 
                'Account Created Succefully ... Please Check Your Email To Activate Acount ... Awaiting admin approval.'
            });
        },

    verifyEmail: 
        async (req, res, next) => {
            const { code } = req.query;
            if (!code) {
                return next(new Error('Invalid activation code', { status: 400 }));
            }
        
            const tempUser = await TemporaryUser.findOne({ activationCode: code });
            if (!tempUser) {
                return next(new Error('Invalid or expired activation code', { status: 400 }));
            }
        
            const newUser = await User.create({
                name: tempUser.name,
                email: tempUser.email,
                password: tempUser.password,
                phoneNumbers: [tempUser.phoneNumber],
                confirmEmail: true,
                role: tempUser.role || systemRoles.USER,
            });
        
            if (newUser.role === systemRoles.VENDOR) {
                const newVendor = await Vendor.create({
                    userId: newUser._id,
                    factoryName: tempUser.factoryName,
                    factoryAddress: tempUser.factoryAddress,
                    taxNumber: tempUser.taxNumber,
                    tradeMark: tempUser.tradeMark,
                    websiteLink: tempUser.websiteLink,
                    instagramLink: tempUser.instagramLink,
                    facebookLink: tempUser.facebookLink,
                });

                const adminRequest = await Request.create({
                    userId: newUser._id,
                    desc: "Ask You To Be A Vendor",
                    type: systemRequests.BE_VENDOR,
                    phoneNumber: tempUser.phoneNumber,
                    data: newVendor._id,
                });
            }
        
            await TemporaryUser.deleteOne({ _id: tempUser._id });
        
            res.status(200).json({
                success: true,
                data: null,
                message: 'Account activated successfully.',
            });
        },

    signIn:
        async(req, res, next) => {
            //! Check fields
            const {email, password} = req.body;
            if(!email || !password) {
                return next(new Error('Pleasse all fields are required', {status: 400}));
            }

            //! User Exist And Activate ?
            const user = await User.findOne({email});
            if(!user) {
                return next(new Error('Invalid email or password', {status: 400}));
            }

            if(!user.confirmEmail) {
                return next(new Error('Please confirmed your email', {status: 400}));
            }

            //! If user is vendor admin appeove to him ?  
            if(user.role === systemRoles.VENDOR && !user.isApproved) {
                return next(new Error('Waiting Admain Approval For You', {status: 400}));
            }

            //! Validate password
            const isMatch = await validatePassword(password, user.password);
            if(!isMatch) {
                return next(new Error('Invalid email or password', {status: 400}));
            }

            //! Create Token
            const token = await generateToken(
                {
                    email,
                    id: user._id,
                }
            ); 

            user.isLoggedIn = true;
            user.token = token;

            await user.save();

            //! Send Response
            res.status(200).json({
                success: true,
                data: {
                    user
                },
                message: `Welcome here ${user.name}`,
            });
        },

    forgetPassword:
        async (req, res, next) => {
            const { email } = req.body;
            //! User Exist ? 
            const user = await User.findOne({
                email,
                confirmEmail: true,
                isDeleted: false,
            });
            if (!user) {
                return next(new Error('Invalid email!', {status: 404 }));
            }

            //! Generate and hashed forget code
            const activationCode = generateUniqueString();

            // //! Generate reset password token
            // const token = await generateToken({ 
            //     email, 
            //     sentCode: hashedCode
            // },
            // "1h"
            // );

            //! Generate reset password link and sent email
            const resetPasswordLink = `${req.protocol}://${req.headers.host}/reset-password/${activationCode}`;

            const isEmailSent = await sendEmail({
                to: email,
                subject: "Reset Passowrd",
                linkTo: resetPasswordLink,
                fileName: "reset-password.ejs"
            });

            //! Check if email is sent successfully
            if (!isEmailSent) {
                return next(new Error("Fail to sent reset password email!", {status: 500}));
            }
        
            //! Save hashed code
            const userUpdates = await User.findOneAndUpdate(
                { email},
                { forgetCode: activationCode },
                { new: true }
            );

            //! Send response
            return res.status(200).json({ 
                success: true, 
                data: userUpdates,
                message: 'Check Your Email To Update Your Password' 
            });
        },

    resetPasswordGet:
        async (req, res, next) => {
            const { code } = req.params;
            //! Decoded token
            // const ok = await validateToken(token, req);

            // const payload = req.user;

            //! Check email in & forget code in DB
            const user = await User.findOne({forgetCode: code});
            if (!user) {
                return next(new Error('You already reset your password!', {status: 404 }));
            }

            return res.status(200).json({
                success: true,
                data: null,
                message: 'Reset Password Here',
            });
        },

    resetPassword:
        async (req, res, next) => {
            const { code } = req.params;
            const { newPassword } = req.body;
            //! Decoded token
            // await validateToken(token, req);
            // const payload = req.user;

            //! Check email in & forget code in DB
            const user = await User.findOne({forgetCode: code});
            if (!user) {
                return next(new Error('You already reset your password!', {status: 404 }));
            }

            //! Hashed new password
            const salt = await generateSalt();
            const hashedNewPassword = await generatePassword(newPassword, salt);
            user.password = hashedNewPassword;
            

            //! Update forget code to null in DB
            user.forgetCode = null;

            //! Save new password in DB
            const resetedPassword = await user.save();
            if (!resetedPassword) {
                return next(new Error('Fail to reset password, try again!', {status: 500}));
            }

            //! Send response
            return res.status(200).json({
                success: true,
                data: null,
                message: 'You Are Reset Your Password Successfully!',
            });
        },

    updatePassword:
        async (req, res, next) => {
            const {_id} = req.authUser;
            // console.log(req.user);
            const {currentPassword, newPassword} = req.body;
            
            //! Get user
            const user = await User.findById(_id);
            
            //! Check password
            const isPasswordValid = await validatePassword(currentPassword, user.password);
            if (!isPasswordValid) {
                return next(new Error('Invalid current password!', { status: 404 }));
            }

            //! Hashed new password and save it in DB
            const salt = await generateSalt();
            const hashedNewPassword = await generatePassword(newPassword, salt);
            user.password = hashedNewPassword;
            user.isLoggedIn = false;

            //! Save new password in DB
            const updatedUserPassword = await user.save();
            
            if (!updatedUserPassword) {
                return next(new Error("Fail to update password, try again!", { status: 400 }));
            }

            //! Send response
            return res.status(200).json({
                success: true,
                data: null,
                message: "Password updated successfully!",
            });
        },
};

module.exports = authCtrl;