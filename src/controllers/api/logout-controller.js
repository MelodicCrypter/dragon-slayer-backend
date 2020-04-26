/**
 * This is where all the logic happens for
 * the /logout endpoint.
 *
 * This endpoint is responsible for logging the user out.
 */

// User model
import User from '../../model/user';
// Util
import stat from '../../util/stat';

// Controller for the /logout endpoint
const logoutEndpoint = async (req, res) => {
    const { token: refreshToken } = req.body;

    try {
        // Log the user out
        const loggedOut = await User.logout(refreshToken);

        // If all went well
        if (loggedOut) res.status(200).json(stat('success', 'You are logged out.'));
    } catch (e) {
        res.json(stat('failed', 'Something is not right.'));
    }
};

export default logoutEndpoint;
