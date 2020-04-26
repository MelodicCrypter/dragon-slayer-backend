/**
 * This is where all the logic happens for
 * the /login endpoint
 */

// User model
import User from '../../model/user';
// Util
import stat from '../../util/stat';

// Controller for the /login endpoint
const loginEndpoint = async (req, res) => {
    // Get all the client's POST values then convert to object
    const { email, password, exp } = req.body;

    // Expirations
    const authExpiration = '15m';
    const refreshExpiration = exp || '90d';

    try {
        // 1. Check if user exists and is verified
        // if no user found send an error message, else, proceed
        const user = await User.findOne({ email });
        if (!user) throw new Error('Check your credentials!');
        const verified = await user.isTokenEmpty('verifyToken');

        // 2.
        if (verified) {
            // Since user is verified, it's time to validate credentials
            const userIsLegit = await User.validateCredentials(email, password);
            // If validated then generate auth and refresh tokens
            const token = await userIsLegit.generateToken('auth', authExpiration);
            const refreshToken = await userIsLegit.generateToken('refresh', refreshExpiration);
            // Send back the tokens
            res.status(200).json(stat('logggedIn', { token, refreshToken }));
        } else {
            throw new Error('Please verify your account first.');
        }
    } catch (e) {
        res.json(stat('failed', e.message));
    }
};

export default loginEndpoint;
