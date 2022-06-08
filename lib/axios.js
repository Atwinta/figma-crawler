const params = require('./params');
const axios = require('axios').default;

axios.defaults.baseURL = 'https://api.figma.com';
axios.defaults.headers.common['X-Figma-Token'] = params.figmaDevToken;

module.exports = axios;
