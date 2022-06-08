const config = require('./config');
const axios = require('axios').default;

axios.defaults.baseURL = 'https://api.figma.com';
axios.defaults.headers.common['X-Figma-Token'] = config.figmaDevToken;

module.exports = axios;
