function ApiError (httpResponse, code, message, name) {
    this.code = code;
    this.message = message || '';
    this.stack = (new Error()).stack;
    this.name = name || 'api_error';
    this.res = httpResponse;
};
ApiError.prototype = Error.prototype;

module.exports = ApiError;