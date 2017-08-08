'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.report = undefined;

var _stacktraceJs = require('stacktrace-js');

var _stacktraceJs2 = _interopRequireDefault(_stacktraceJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOptions = {
  baseApi: 'https://clouderrorreporting.googleapis.com/v1beta1/projects',
  serviceContext: { service: 'web' },
  disabled: false
};

var sendError = function sendError(message, callback) {
  var url = defaultOptions.baseApi + '/' + defaultOptions.projectId + '/events:report?key=' + defaultOptions.apiKey;
  fetch(url, {
    method: 'post',
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({
      context: {
        httpRequest: {
          userAgent: window.navigator.userAgent,
          url: window.location.href
        }
      },
      eventTime: new Date(),
      message: message,
      serviceContext: defaultOptions.serviceContext
    })
  }).then(function () {
    return typeof callback === 'function' && callback();
  }).catch(function (error) {
    return typeof callback === 'function' && callback(error);
  });
};

// This will use sourcemaps and normalize the stack frames
var getFormattedErrorMessage = function getFormattedErrorMessage(error) {
  return _stacktraceJs2.default.fromError(error).then(function (stack) {
    var errorName = error.toString();
    var formatValues = function formatValues(v) {
      return '    at ' + (v.getFunctionName() || '') + ' \n(' + v.getFileName() + ':' + v.getLineNumber() + ':' + v.getColumnNumber() + ')';
    };
    var formattedStack = stack.map(formatValues).filter(function (v, i) {
      return i > 0;
    }).join('\n');
    return errorName + '\n' + formattedStack;
  });
};

var report = exports.report = function report(error, callback) {
  if (!error && typeof callback === 'function') {
    return callback('no error to report');
  }

  if (typeof error === 'string' || error instanceof String) {
    // Transform the message in an error, use try/catch to make sure the stacktrace is populated.
    try {
      throw new Error(error);
    } catch (e) {
      error = e;
    }
  }
  // This will use sourcemaps and normalize the stack frames
  getFormattedErrorMessage(error).then(function (message) {
    return sendError(message, callback);
  });
};

exports.default = function (options) {
  if (!options.apiKey) {
    throw new Error('Cannot initialize: No API key provided.');
  }
  if (!options.projectId) {
    throw new Error('Cannot initialize: No project ID provided.');
  }
  defaultOptions = Object.assign({}, defaultOptions, options);
};
