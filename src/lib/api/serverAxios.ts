import { __config } from '@/constants/config';
import axios from 'axios';
import { cookies } from 'next/headers';
import { Security } from '../security';

const security = new Security();
const serverAxios = axios.create({
    baseURL: __config.APP.BASE_URL,
    withCredentials: true,
    headers: {
        'X-App-Version': '1.0.0',
        'X-App-Name': 'Airmail IMAP Client',
        'X-Powered-By': 'ENJOYS',
        'x-api-key': __config.APP.API_KEY,
    }
});

serverAxios.interceptors.request.use(async (config) => {

    security.GenerateSignature((config.method as string).toUpperCase(), config.baseURL as string, config.data).then((signature) => {
        config.headers['X-Signature'] = signature
    })
    config.headers["Authorization"] = "JWT " + (await cookies()).get('access_token')?.value
    return config;
}, (error) => {
    return Promise.reject(error);
});
serverAxios.interceptors.response.use(async function (response) {

    if (response.data.message === "Login required"
        || response.data.message === "Connection not available"
        && response.data.success === false) {
        await serverAxios.get("/api/v1/imap/relogin", {
            withCredentials: true,
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airmail IMAP Client',
                'X-Powered-By': 'ENJOYS',
                'x-api-key': __config.APP.API_KEY,
                "Authorization": "JWT " + (await cookies()).get('access_token')?.value
            }
        })

        const originalRequest = response.config;
        return serverAxios(originalRequest);

    }
    return response;
}, function (error) {

    return Promise.reject(error);
});

export default serverAxios;