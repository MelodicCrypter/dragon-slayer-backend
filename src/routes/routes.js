/**
 * These are all the routes for this application:
 *
 * PUBLIC ENDPOINTS:
 * NO AUTHENTICATION AT ALL
 * /user => registering a user
 * /verify => verifying user's account using verifyToken
 * /login => the login process, responsible for authToken and refreshToken
 *
 * SEMI-PUBLIC ENDPOINTS:
 * NO AUTHENTICATION BUT REFRESH TOKEN IS REQUIRED
 * /token => request for new authToken using refreshToken
 * /logout => logs out the user using refreshToken
 *
 * PRIVATE ENDPOINTS:
 * AUTHENTICATION IS REQUIRED
 * /user/me => user's info or profile
 */

import express from 'express';

// Middlewares
import authenticate from '../middlewares/authenticate';
// All Controllers
import userEndpointController from '../controllers/api/user-controller';
import verifyEndpointController from '../controllers/api/verify-controller';
import loginEndpointController from '../controllers/api/login-controller';
import logoutEndpointController from '../controllers/api/logout-controller';
import userMeEndpointController from '../controllers/api/user-me-controller';
import tokenEndpointController from '../controllers/api/token-controller';

// Router instance
const router = express.Router();

// Routes
// Public: No Authentication required
router.post('/user', userEndpointController); // POST
router.get('/verify', verifyEndpointController); // GET
router.post('/login', loginEndpointController); // POST
// Semi-Public: No Authentication but Refresh Token Required
router.post('/token', tokenEndpointController); // POST
router.post('/logout', logoutEndpointController); // POST
// Private: Authentication is required
router.get('/user/me', authenticate, userMeEndpointController); // GET

export default router;
