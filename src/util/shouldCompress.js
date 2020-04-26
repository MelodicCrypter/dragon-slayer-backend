/**
 * This is the filter function for compression
 * it will detect if the response will be compressed
 * or not.
 */

import compression from 'compression';

const shouldCompress = (req, res) => {
    // No compression
    if (req.headers['x-no-compression']) return false;
    // fallback to standard compression
    return compression.filter(req, res);
};

export default shouldCompress;
