const User = require('../../../database/models/User.js');
const Token = require('../../../database/models/Token.js');

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
const {activateTemplate} = require('../../utils/activateTemplate.js');
const { verify } = require('jsonwebtoken');



const authCtrl = {

    signUp: asyncHandler(
        async(req, res, next) => {
            //! Check Fields
            const { name, email, password, age, role, phoneNumbers} = req.body;
            if(!name || !email || !password || !age || !role || !phoneNumbers) {
                return next(new Error('Pleasse all fields are required', {status: 400}));
            }

            //! User Exist ?
            const userExist = await User.findOne({email});
            if(userExist) {
                return next(new Error('User already existed', {status: 400}));
            }
            
            //! Hashed password
            const salt = await GenerateSalt();
            const hashedPassword = await GeneratePassword(password, salt);
            
            //! Save User in database
            const newUser = await User.create({
                name, 
                email, 
                password: hashedPassword, 
                age, 
                role, 
                phoneNumbers,
            });

            //! Create Token
            const token = await GenerateSignature({
                email: email,
                id: newUser._id
            });

            
            //! Activate User
            const PORT = process.env.PORT;
            const activationLink = `${req.protocol}://${req.headers.host}/activate/?token=${token}`;
            // const activationLink = activateTemplate(`${req.protocol}://${req.headers.host}/activate/?token=${token}`);
            // console.log(activationLink);
            const isEmailSent = await sendEmail({
                to: email,
                subject: 'Account Activation',
                ///////////////////  change //////////////////////
                html: `<a href="${activationLink}">Click here to activate your account</a>`,
            });
            if (!isEmailSent) {
                return next(new Error('Fail to sent reset password email!', {status: 400}));
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
        }
    ),

    verifyEmail: asyncHandler(
        async(req, res, next) => {
            //! Recieve token and Decode it
            const {token} = req.query;
            console.log(token);
            await ValidateSignature2(token, req);
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
        }
    ),
    
    signIn : asyncHandler(
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
            const isMatch = await ValidatePassword(password, user.password);
            if(!isMatch) {
                return next(new Error('Invalid email or password', {status: 400}));
            }

            //! Create Token
            const token = await GenerateSignature(
                {
                    email,
                    user: user._id,
                }
            );

            //! Save Token
            await Token.create(
                {
                    token,
                    user: user._id
                }
            ) 

            //! Send Response
            res.status(200).json({
                success: true,
                data: {
                    user,
                    token: token,
                },
                message: `Welcome here ${user.name}`,
            });
        }
    ),

    forgetPassword: asyncHandler(
        async (req, res, next) => {
            const { email } = req.body;
            //! User Exist ? 
            const user = await User.findOne({
                email,
                confirmEmail: true,
                isBlocked: false,
            });
            if (!user) {
                return next(new Error('Invalid email!', {status: 404 }));
            }

            //! Generate and hashed forget code
            const code = generateUniqueString(6);
            const salt = await GenerateSalt();
            const hashedCode = await GeneratePassword(code, salt);

            //! Generate reset password token
            const token = await GenerateSignature({ 
                email, 
                sentCode: hashedCode
            },
            "1h"
            );

            //! Generate reset password link and sent email
            const resetPasswordLink = `${req.protocol}://${req.headers.host}/reset/?token=${token}`;

            const isEmailSent = await sendEmail({
                to: email,
                subject: "Reset Passowrd",
                html: `
                    <h2>please click on this link to reset your password</h2>
                    <a href="${resetPasswordLink}">Reset Password</a>
                    `,
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
                message: 'Check Your Email To Update Your Password' 
            });
        }
    ),

    resetPassword: asyncHandler(
        async (req, res, next) => {
            const { token } = req.query;
            const { newPassword } = req.body;
            //! Decoded token
            await ValidateSignature2(token, req);
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
            const salt = await GenerateSalt();
            const hashedNewPassword = await GeneratePassword(newPassword, salt);
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
        }
    ),

    updatePassword: asyncHandler(
        async (req, res, next) => {
            const _id = req.user.user;
            // console.log(req.user);
            const {currentPassword, newPassword} = req.body;
            
            //! Get user
            const user = await User.findById(_id);
            
            //! Check password
            const isPasswordValid = await ValidatePassword(currentPassword, user.password);
            if (!isPasswordValid) {
                return next(new Error('Invalid current password!', { status: 404 }));
            }

            //! Hashed new password and save it in DB
            const salt = await GenerateSalt();
            const hashedNewPassword = await GeneratePassword(newPassword, salt);
            user.password = hashedNewPassword;

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
        }
    ) 
};

module.exports = authCtrl;