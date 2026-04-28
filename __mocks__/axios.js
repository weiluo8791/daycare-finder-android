// Mock for axios — used by api/client.ts
// Use regular functions for interceptors so jest.clearAllMocks() doesn't wipe them.
var requestInterceptors = [];
var responseSuccessInterceptors = [];
var responseErrorInterceptors = [];

var mockAxiosInstance = {
  interceptors: {
    request: {
      use: function(handler) { requestInterceptors.push(handler); },
    },
    response: {
      use: function(handler, errorHandler) {
        responseSuccessInterceptors.push(handler);
        if (errorHandler) responseErrorInterceptors.push(errorHandler);
      },
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

var mockAxiosPost = jest.fn();

var axios = {
  create: jest.fn(function() { return mockAxiosInstance; }),
  post: function() { return mockAxiosPost.apply(null, arguments); },
};

module.exports = axios;
module.exports.default = axios;
module.exports._mockInstance = mockAxiosInstance;
module.exports._mockPost = mockAxiosPost;
module.exports._requestInterceptors = requestInterceptors;
module.exports._responseSuccessInterceptors = responseSuccessInterceptors;
module.exports._responseErrorInterceptors = responseErrorInterceptors;
