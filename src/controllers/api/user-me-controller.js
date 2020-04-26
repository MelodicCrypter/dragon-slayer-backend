/**
 * This is where all the logic happens for
 * the /user/me endpoint. This is a private endpoint,
 * so it needs the authentication middleware
 * before the user can get to this endpoint.
 *
 * This endpoint is responsible for geting user's details.
 */

import _ from 'lodash';

// User model
import User from '../../model/user';
// Util
import stat from '../../util/stat';

// Controller for the /user/me endpoint
const userMeEndpoint = async (req, res) => {
    // Get the user's id from authentication middleware
    const { authId } = req;

    try {
        // Get the user currently logged in
        const user = await User.findOne({ _id: authId });
        if (!user) throw new Error('No user found!');

        // Prep user object {}
        const prepUser = _.pick(user, ['_id', 'username', 'email', 'authToken']);

        // Send back message
        res.json(prepUser);
    } catch (e) {
        res.json(stat('failed', 'Something went wrong.'));
    }
};

export default userMeEndpoint;
