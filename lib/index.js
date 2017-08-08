import StackTrace from 'stacktrace-js';

let defaultOptions = {
  baseApi: 'https://clouderrorreporting.googleapis.com/v1beta1/projects',
  serviceContext: { service: 'web' },
  disabled: false,
};

const sendError = (message, callback) => {
  const url = `${defaultOptions.baseApi}/${defaultOptions.projectId}/events:report?key=${defaultOptions.apiKey}`;
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
      message,
      serviceContext: defaultOptions.serviceContext,
    })
  })
    .then(() => typeof callback === 'function' && callback())
    .catch((error) => typeof callback === 'function' && callback(error));
};

// This will use sourcemaps and normalize the stack frames
const getFormattedErrorMessage = error =>
  StackTrace.fromError(error).then((stack) => {
    const errorName = error.toString();
    const formatValues = v => `    at ${v.getFunctionName() || ''} 
(${v.getFileName()}:${v.getLineNumber()}:${v.getColumnNumber()})`;
    const formattedStack = stack
      .map(formatValues)
      .filter((v, i) => i > 0)
      .join('\n');
    return `${errorName}\n${formattedStack}`;
  });

export const report = (error, callback) => {
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
  getFormattedErrorMessage(error)
    .then(message => sendError(message, callback));
};

export default (options) => {
  if (!options.apiKey) {
    throw new Error('Cannot initialize: No API key provided.');
  }
  if (!options.projectId) {
    throw new Error('Cannot initialize: No project ID provided.');
  }
  defaultOptions = Object.assign({}, defaultOptions, options);
};

