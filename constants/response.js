module.exports = {

    INTERNAL_ERROR: 'Server internal error',
    NOT_ENOUGH_PARAMS: 'Not enough incoming parameters',
    NOT_VALID_EMAIL: 'Email field should contain a valid email address',
    NOT_VALID_PASS: 'Password field value is incorrect. It should contain only (6-35) the following symbols: A-Z, a-z, 0-9',

    AUTH: {
        UN_AUTHORIZED: 'Un Authorized',
        LOG_IN: 'Login successful',
        LOG_OUT: 'Logout successful',
        REGISTER: 'Register successful',
        REGISTER_SEND_CONFIRMATION: 'Send confirmation on email. Check Email',
        EMAIL_NOT_CONFIRMED: 'Registration not confirmed. Check Email',
        REGISTER_EMAIL_CONFIRMED: 'Register confirmed',
        REGISTER_EMAIL_USED: 'Email is used',
        INVALID_CREDENTIALS: 'Invalid email or password',
        NO_PERMISSIONS: 'Access denied',
        EMAIL_NOT_REGISTERED : 'This email isn\'t registered'
    },

    ON_ACTION: {
        NOT_FOUND: 'Not found ',
        BAD_REQUEST: 'Bad Request',
        SUCCESS: 'Success'
    }
};