/**
 *   This is the USER model.
 *   This allows creation, updates, deletion,
 *   authentication, authorization, etc for
 *   new and existing users
 */

import bcrypt from 'bcrypt';
import _ from 'lodash';
import jwt from 'jsonwebtoken';

// Mongoose
import Mongoose from './mongo/mongoose';

// Create a Mongoose schema
// All validations are handled by Joi inside /controllers
// Meaning, before data is given to Mongoose it is already
// validated by Joi, except for email: { unique }
const userSchema = new Mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    verifyToken: {
        type: String,
    },
    authToken: {
        type: String,
    },
    resetToken: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
});

// ! BEFORE SAVING, check password if modified
// For new and existing users, [re]-authenticate first
// ISSUE: AS OF NOW, ONLY WORKS FOR NEWLY CREATED USERS
userSchema.pre('save', async function(next) {
    const user = this;

    // If the password under User model has been updated or
    // a new password is created upon sign up, then this will trigger
    if (user.isModified('password')) {
        // Hash the password
        const hashedPass = await bcrypt.hash(user.password, 10);
        // Save the hashed password
        user.password = hashedPass;
        // Proceed to next middleware, save()
        next();
    } else {
        // If not modified then just proceed to save()
        next();
    }
});

// ! OVERRIDE toJSON method to only return id and email
// We don't want to include the password inside response
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject(); // convert mongoose object to standard object
    return _.pick(userObject, ['_id', 'email']);
};

// generateToken()
// Instance method that will generate a token
userSchema.methods.generateToken = function(tokenType, exp) {
    const user = this;
    let token;
    const keywords = ['verify', 'auth', 'reset', 'refresh'];

    // 0. Check first
    if (!keywords.includes(tokenType)) return Promise.reject(new Error('Invalid Keyword'));

    // 1. JWT: payload
    const payload = { _id: user._id.toHexString() };

    // 2. JWT: CREATE token for refresh and other tokens
    // if expiration is not set the default is 1 hour
    // Check first if what type cause secrets varies for each
    if (tokenType === 'refresh') {
        token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: exp ? `${exp}` : '1h' });
    } else if (tokenType === 'auth') {
        token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: exp ? `${exp}` : '1h' });
    } else {
        token = jwt.sign(payload, process.env.SALT_TOKEN, { expiresIn: exp ? `${exp}` : '1h' });
    }

    // 3. Process the changes
    // tokenType can be 'verify', 'auth', 'reset', and 'refresh'
    if (tokenType === 'verify') user.verifyToken = token;
    if (tokenType === 'auth') user.authToken = token;
    if (tokenType === 'reset') user.resetToken = token;
    if (tokenType === 'refresh') user.refreshToken = token;

    // Save then return the token
    return user.save().then(() => token);
};

// removeToken()
// Instance method that will remove a certain token
userSchema.methods.removeToken = function(tokenType) {
    const user = this;
    return user.updateOne({ [tokenType]: '' });
};

// checkTokenEmpty()
// Instance method that will return true/false if saved token is empty
// For instance, if verifyToken is empty then the user has been verified
userSchema.methods.isTokenEmpty = function(whatToken) {
    const user = this;

    // Check
    if (user[whatToken] === '') return true;

    return false;
};

// isTokenActiveAndAuthentic()
// Instance method that will check token if active and authentic
userSchema.methods.isTokenActiveAndAuthentic = async function(whatToken, refreshToken) {
    const user = this;
    let active = false;
    let authentic = false;

    // Check if active
    if (user[whatToken] !== '') active = true;
    // Check if authentic
    if (user[whatToken] === refreshToken) authentic = true;

    // Process
    if (active && authentic) return true;

    return false;
};

// validateToken()
// Static method that will validate all 'refresh', 'auth', 'verify', and 'reset' tokens
userSchema.statics.validateToken = function(token, type) {
    let decoded;

    try {
        // Verify using jwt
        if (type === 'refresh') decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        if (type === 'auth') decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (type !== 'refresh' && type !== 'auth') decoded = jwt.verify(token, process.env.SALT_TOKEN);
    } catch (e) {
        // jwt code errors are TokenExpiredError and JsonWebTokenError
        return Promise.reject(e);
    }

    return decoded;
};

// validateCredentials()
// Static method that will validate login credentials
userSchema.statics.validateCredentials = async function(loginEmail, loginPassword) {
    const user = this;
    // Check user
    const foundUser = await user.findOne({ email: loginEmail });
    // If the user does not exist
    if (!foundUser) return Promise.reject(new Error('No user found.'));
    // Compare passwords
    const match = await bcrypt.compare(loginPassword, foundUser.password);
    // If doesn't match
    if (!match) return Promise.reject(new Error('Check your credentials.'));
    // If legit
    return foundUser;
};

// deleteAccount()
// Static method that will delete the user's account totally
// can both accept token or email as identifier, but it should
// only use one, it cannot use both token and email
// for token => deleteAccount(token)
// for email => deleteAccount('', email)
userSchema.statics.deleteAccount = function(token, email) {
    const user = this;

    // If token was used as an identifier
    if (token && token !== '') {
        return user.findOneAndDelete({ verifyToken: token });
    }

    // If email was used as an identifier
    return user.findOneAndDelete({ email });
};

// updateHashPassword()
// Static method for updating the user's password
userSchema.statics.updateHashPassword = async function(id, password) {
    const user = this;

    // Hash password and update user
    const hashedPass = await bcrypt.hash(password, 10);
    const updatedUser = await user.findByIdAndUpdate(id, { password: hashedPass });

    return updatedUser;
};

// logout()
// Static method that will log out the user
userSchema.statics.logout = async function(token) {
    const user = this;

    // Search token
    // since this is the /logout endpoint the token here
    // is probably the refreshToken
    const foundUser = await user.findOne({ refreshToken: token });
    // If the refreshToken does not exist anymore
    if (!foundUser) return Promise.reject(new Error('No user found.'));
    // If exists, empty both auth and refresh tokens
    foundUser.authToken = '';
    foundUser.refreshToken = '';
    // Save user
    await foundUser.save();

    return true;
};

// Create User model
const User = Mongoose.model('User', userSchema);

export default User;
