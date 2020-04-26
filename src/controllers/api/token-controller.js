/**
 * This is where all the logic happens for
 * the /token endpoint. Basically, this endpoint
 * will check the refreshToken if it still valid
 * and active so that it can be used it generating
 * new authToken.
 */

// User model
import User from '../../model/user';
// Util
import stat from '../../util/stat';

// Controller for the /token endpoint
const tokenEndpoint = async (req, res) => {
    // Get the refreshToken
    const { token: refreshToken } = req.body;
    // Expiration
    const authExpiration = '15m';

    try {
        // 1. Check and validate token
        const decoded = await User.validateToken(refreshToken, 'refresh');

        // 2. Check if user exists
        // if no user found send an error message, else, proceed
        const user = await User.findOne({ _id: decoded._id });
        if (!user) throw new Error('Something is not right.');

        // 3. Double check if refreshToken is still active
        // saved refreshToken is equal to sent refreshToken
        // meaning the user has not logged out yet
        const userRefreshToken = await user.isTokenActiveAndAuthentic('refreshToken', refreshToken);
        if (!userRefreshToken) throw new Error('The token is already invalid.');

        // 4. Generate new authToken
        const authToken = await user.generateToken('auth', authExpiration);

        // 5. Send back the tokens
        res.status(200).json(stat('success', { authToken }));
    } catch (e) {
        // If expired
        // Let the client know that the refreshToken is already expired
        // so that they can login again to get a new set of authToken and refreshToken
        if (e.name === 'TokenExpiredError') {
            res.json(stat('expired', 'Please log in again.'));
        } else {
            res.json(stat('failed', 'Something is not right.'));
        }
    }
};

export default tokenEndpoint;
