module.exports = {

    INTERNAL_ERROR: 'Server internal error',
    NOT_ENOUGH_PARAMS: 'Not enough incoming parameters',
    NOT_VALID_EMAIL: 'Email field should contain a valid email address',
    NOT_VALID_PASS: 'Password field value is incorrect. It should contain only (6-35) the following symbols: A-Z, a-z, 0-9',
    NOT_MARKETEER: 'You dont have marketeer. Please select marketeer first',
    NOT_ALLOW_ADD_PRICE_OTHER_MARKETEER: 'You can not add cost, because you have already given to another marketeer',
    NOT_ALLOW_CHANGE_MARKETEER: 'You are blocked to change marketeer',
    NOT_ALLOW_TOO_MUCH_PRICE_FOR_DAY: 'Too much price for 1 day for 1 crop',
    NOT_ALLOW_DATE_SELECTED: 'Can not save price for selected day of week. Markets not work on Friday and on Saturday',

    AUTH: {
        UN_AUTHORIZED: 'Un Authorized',
        LOG_IN: 'Login successful',
        LOG_OUT: 'Logout successful',
        REGISTER_SUCCESSFUL: 'Register successful',
        REGISTER_SEND_CONFIRMATION: 'Send confirmation on email. Check Email',
        FORGOT_SEND_EMAIL: 'Send instruction on email. Check Email',
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