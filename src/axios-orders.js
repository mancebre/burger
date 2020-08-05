import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://my-burger-c7dea.firebaseio.com/'
});

export default instance;