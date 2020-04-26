/**
 *
 * The backend is coded with ES6+ syntax and transpiled by Babel-Node
 *
 */

import {} from 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import compression from 'compression';

// Util
import shouldCompress from './util/shouldCompress';

// Routes
import router from './routes/routes';

// Instance of of Express
const app = express();
// App will run on 3000 during development
// But it will automatically set if deployed: e.g Heroku
const port = process.env.PORT || 9000;

// Middlewares: Security
// Consider CSP and SRI for more security features
app.use(cors({ origin: ['http://localhost:5000', /\.netlify\.app$/] })); // Cross-Origin
app.use(helmet()); // Security for HTTP requests
app.use(compression({ filter: shouldCompress, threshold: 0 })); // Compresses response
app.use(express.json({ limit: '300kb' })); // Allows JSON but with limit
app.use(hpp()); // Protection against Paramenter Pollution Attacks
app.use(express.urlencoded({ extended: true }));

// Load API routes
app.use('/', router);

// Running the server
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
