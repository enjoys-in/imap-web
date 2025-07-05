
import { __config } from '@/constants/config'
import axios from 'axios'
import { Security } from '../security';
import { manualDelay } from '../utils';

const security = new Security();


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

    security.GenerateSignature((config.method as string).toUpperCase(), `${config.baseURL}${config.url}` as string, config?.data,).then((signature) => {
        config.headers['X-Signature'] = signature
    })


    return config;
}, (error) => {
    return Promise.reject(error);
});
instance.interceptors.response.use(
    async (response) => {
        if (response.status === 401) {
            window.location.href = '/auth';
        }
        // if (response.data.message = "Login required") {
        //     await instance.get("/api/v1/imap/relogin")
        //     await manualDelay(3000)
        //     const originalRequest = response.config;
        //     return instance(originalRequest);
        // }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
)
