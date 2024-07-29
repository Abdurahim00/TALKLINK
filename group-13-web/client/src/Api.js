import axios from 'axios';

const Api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/',
  withCredentials: true
});

export default Api;
