/**
 * This is where all the logic happens for
 * the /user endpoint
 */

import _ from 'lodash';
import Joi from '@hapi/joi';

// User model
import User from '../../model/user';
// Email config and template
import transport from '../../util/email/config';
import emailTemplate from '../../util/email/email-template';
// Util
import stat from '../../util/stat';

// Controller for the /user endpoint
const userEndpoint = async (req, res) => {
    // Get all the client's POST values then convert to object
    const body = _.pick(req.body, ['username', 'email', 'password']);

    // JOI Validation Schema: Validate all fields first before sending to Mongoose
    const joiSchema = Joi.object().keys({
        username: Joi.string()
            .trim()
            .required(),
        email: Joi.string()
            .email()
            .trim()
            .required(),
        password: Joi.string()
            .pattern(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8})/)
            .trim()
            .required(),
    });

    try {
        // JOI validation, value === new user details {}
        const value = await joiSchema.validateAsync(body);

        // Just double check, if everything is fine, save the user
        if (value) {
            // Delete first the repeat_password property
            // Only the email and the password is needed
            // the pasword will be hashed inside User model of Mongoose
            delete value.repeat_password;

            // Create new User instance
            const user = new User(value);

            // Try saving the user
            // We need to put in a try/catch because we need to check
            // inside mongodb if the user already exist
            try {
                // Save the user
                const savedUser = await user.save();

                // Set token for account verification
                const token = await savedUser.generateToken('verify', '120d');
                // If all goes well, send the 'verify' token to the user's email
                // Nodemailer is going to handle this
                await transport.sendMail({
                    from: process.env.MAIL_USER,
                    to: savedUser.email,
                    subject: `Please Verify Your Account | ${process.env.SITE_NAME}`,
                    html: emailTemplate(`${process.env.SITE_URI}/verify/token=${token}`),
                });
                // If everything went well tell user to check his/her email
                res.status(200).json(stat('created', 'To verify your account please check your email. 😃'));
            } catch ({ code }) {
                // If user already exist
                if (code === 11000) res.json(stat('failed', 'Double-check email!'));
            }
        }
    } catch (e) {
        // Get the error label
        const error = e.details[0].context.label;
        // Long error message
        const passErr =
            'Password must be a mixed of numbers, special character, uppercase and lowercase letters, and at least 8 characters long.';

        // Process
        if (error === 'email') res.json(stat('failed', 'Invalid Email!'));
        if (error === 'password') res.json(stat('failed', passErr));
        if (error === 'username') res.json(stat('failed', 'Username required'));
    }
};

export default userEndpoint;
