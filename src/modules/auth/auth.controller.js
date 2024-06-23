const User = require('../../../database/models/User.js');
const Vendor = require('../../../database/models/Vendor.js');
const Request = require('../../../database/models/Request.js');

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
            const userExist = await User.findOne({email, role: systemRoles.USER});
            if(userExist) {
                return next(new Error('User already existed', {status: 400}));
            }
            
            //! Hashed password
            const salt = await generateSalt();
            const hashedPassword = await generatePassword(password, salt);
            
            //! Save User in database
            const newUser = await User.create({
                name, 
                email, 
                password: hashedPassword, 
                phoneNumbers: [phoneNumber],
            });

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

            /////////////////////////// cart here ////////////////////////////////////

            //! Send Response
            res.status(200).json({
                success: true,
                data: {
                    role: newUser.role,
                    email,
                    name,
                    _id: newUser._id,
                },
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
            const userExist = await User.findOne({email, role: systemRoles.VENDOR});
            if(userExist) {
                return next(new Error('User already existed', {status: 400}));
            }
            
            //! Hashed password
            const salt = await generateSalt();
            const hashedPassword = await generatePassword(password, salt);
            
            //! Save User in database
            const newUser = await User.create({
                name, 
                email, 
                password: hashedPassword, 
                phoneNumbers: [phoneNumber],
                role: systemRoles.VENDOR
            });

            //! Save Vendor-details in database
            const newVendor = await Vendor.create({
                userId: newUser._id,
                factoryName, 
                factoryAddress, 
                taxNumber,
                tradeMark: tradeMark || "", 
                websiteLink: websiteLink | "", 
                instagramLink: instagramLink || "", 
                facebookLink: facebookLink || ""
            });

            //! Send request to admin, save
            const adminRequest = await Request.create({
                userId: newUser._id,
                desc: "Ask You To Be A Vendor",
                type: systemRequests.BE_VENDOR,
                phoneNumber,
                data: newVendor._id,
            });

            //! Send Response
            res.status(200).json({
                success: true,
                data: null,
                message: 'Vendor signed up successfully. Awaiting admin approval.'
            });
        },

    verifyEmail:
        async(req, res, next) => {
            //! Recieve token and Decode it
            const {token} = req.query;
            // console.log(token);
            await validateToken(token, req);
            const payload = req.user;

            //! User exist ?
            const user = await User.findOneAndUpdate(
                {email: payload.email}, 
                {confirmEmail: true}, 
                {new: true}
            );
            if (!user) {
                return next(new Error('User not found', {status: 404}));
            }
    
            //! Send response
            res.status(200).json({
                sucess: true, 
                data: {user},
                message: 'Account Activated, Try to login'
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
            const code = generateUniqueString(6);
            const salt = await generateSalt();
            const hashedCode = await generatePassword(code, salt);

            //! Generate reset password token
            const token = await generateToken({ 
                email, 
                sentCode: hashedCode
            },
            "1h"
            );

            //! Generate reset password link and sent email
            const resetPasswordLink = `${req.protocol}://${req.headers.host}/reset-password/${token}`;

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
                {email},
                {forgetCode: hashedCode},
                { new: true}
            );

            //! Send response
            return res.status(200).json({ 
                success: true, 
                data: userUpdates,
                token,
                message: 'Check Your Email To Update Your Password' 
            });
        },

    resetPasswordGet:
        async (req, res, next) => {
            const { token } = req.params;
            //! Decoded token
            const ok = await validateToken(token, req);

            const payload = req.user;

            //! Check email in & forget code in DB
            const user = await User.findOne({
                email: payload?.email,
                forgetCode: payload?.sentCode,
            });
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
            const { token } = req.params;
            const { newPassword } = req.body;
            //! Decoded token
            await validateToken(token, req);
            const payload = req.user;

            //! Check email in & forget code in DB
            const user = await User.findOne({
                email: payload?.email,
                forgetCode: payload?.sentCode,
            });
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