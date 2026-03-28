
import { __config } from '@/constants/config'
import axios from 'axios'
import { generateSignatureAction } from '../actions/crypto.actions';
import { manualDelay } from '../utils';


export const instance = axios.create({
    baseURL: __config.APP.BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': __config.APP.APP_URL,
    },
})
instance.defaults.headers["common"] = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    'X-App-Version': '1.0.0',
    'X-App-Name': 'Airmail IMAP Client',
    'X-Powered-By': 'ENJOYS',
    'x-api-key': __config.APP.API_KEY,
}

instance.interceptors.request.use(async (config) => {

    const signature = await generateSignatureAction((config.method as string).toUpperCase(), `${config.baseURL}${config.url}` as string, config?.data)
    config.headers['X-Signature'] = signature


    return config;
}, (error) => {
    return Promise.reject(error);
});
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
)
