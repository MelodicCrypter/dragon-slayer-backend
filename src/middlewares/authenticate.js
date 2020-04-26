/**
 * This middelware is responsible for authenticating
 * the user first before allowing to use all private
 * endpoints. The application provides refresh and auth
 * tokens.
 *
 * As a whole, the auth tokens expires within 15 minutes
 * and the refresh tokens expires within 90 days unless specified
 * by the client side
 */

// Mongoose
import User from '../model/user';
// Util
import stat from '../util/stat';

const authenticate = async (req, res, next) => {
    // Get the token from the Bearer
    let authToken = req.headers['x-access-token'] || req.headers['authorization'];

    // If there is no token at all
    if (authToken === null || authToken === undefined)
        return res.json(stat('failed', 'Sorry, authentication is required.'));

    // Remove Bearer string
    // token = token.slice(7, token.length);
    authToken = authToken.split(' ')[1];

    try {
        // Check and validate token: if expired or not valid
        const decoded = await User.validateToken(authToken, 'auth');

        // If above passes, manual checking is next. Check if user isn't logged out yet.
        // Use-case: User's token isn't expired yet, but user just logged out as well
        // so if that token is used to execute actions it would still work
        // for that reason, manual checking is needed
        const user = await User.findOne({ authToken });
        if (!user) throw new Error('Token does not exist!');

        // Setup id so that next middleware can use it
        req.authId = decoded._id;

        // Proceed to the next middleware
        next();
    } catch (e) {
        // If expired
        // Let the client know that the authToken is already expired
        // so that they can request a new one using the refreshToken
        if (e.name === 'TokenExpiredError') {
            res.json(stat('expired', 'Sorry, authentication is required.'));
        } else {
            res.json(stat('failed', 'Sorry, authentication is required.'));
        }
    }
};

export default authenticate;
