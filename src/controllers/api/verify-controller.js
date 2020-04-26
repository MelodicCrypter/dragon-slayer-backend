/**
 * This is where all the logic happens for
 * the /verify endpoint
 */

// User model
import User from '../../model/user';
// Util
import stat from '../../util/stat';

// Controller for the /verify endpoint
const verifyEndpoint = async (req, res) => {
    const { token } = req.query;

    // 1. Verify first
    try {
        // Verify using User static method validateToken()
        // If invalid or expired the first catch() block will fire
        const decoded = await User.validateToken(token);

        // 2. Find the user in the database using the decoded _id
        try {
            // If user not found, the second catch() block will fire
            const user = await User.findOne({ _id: decoded._id });

            // Check if user is already verified
            if (user.isTokenEmpty('verifyToken')) {
                res.json(stat('alreadyVerified', 'Token is already invalid.'));
            } else {
                // If not verified, empty the user's verifyToken property
                user.removeToken('verifyToken')
                    .then(() => res.json(stat('verified', 'Great! You may now login. 😊')))
                    .catch(e => console.log('Error in /verify'));
            }
        } catch (e) {
            res.json(stat('failed', 'Sorry, something went wrong. Double check everything.'));
        }
    } catch (e) {
        // Since this is the /verify endpoint, it means that the user
        // has not verified the  account yet. But what if the token
        // has already expired and the user has only one email address,
        // we'll delete user's previous account in order to make a new one.

        // Detect Errors
        if (e.name === 'TokenExpiredError') {
            // If expired, meaning account exist but not yet verified
            // and the token already expired, then Delete account
            // deleteAccount(token, email)
            // only use one identifier, cannot use both
            // for token => deleteAccount(token)
            // for email => deleteAccount('', email)
            await User.deleteAccount(token);
            // Send error message
            res.json(
                stat(
                    'failed',
                    'Token is alrady expired. Please create a new account. You can use your previous email if you want.',
                ),
            );
        }

        if (e.name === 'JsonWebTokenError') {
            // Send error message
            res.json(stat('failed', 'Invalid Token!'));
        }
    }
};

export default verifyEndpoint;
