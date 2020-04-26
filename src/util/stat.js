/**
 *
 * This is a utility that will return an object to the
 * client's request. The stat() will require two arguments:
 * status and message
 * the message can be a string or an object
 *
 * Example return would be:
 * {
 *     status: 'failed'
 *     message: 'Do this and that'
 * }
 */

const stat = (status, message, code = '') => {
    return {
        status,
        message,
        code,
    };
};

export default stat;
