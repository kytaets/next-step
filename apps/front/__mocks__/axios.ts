const mockAxios = {
  request: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  create: function () {
    return mockAxios; // axios.create() повертає цей же інстанс
  },
};

export default mockAxios;
