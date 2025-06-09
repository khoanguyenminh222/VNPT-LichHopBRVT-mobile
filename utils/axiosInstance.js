// axiosInstance.js
import { domain, tokenRoute } from '../api/baseURL';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from './NavigationService';

const axiosInstance = axios.create({
    baseURL: domain,
});

const handleLogoutCAS = async () => {
    try {
        const casLogoutUrl = `${process.env.casURL}/logout?service=${process.env.logoutCAS}`;
        console.log("Logging out to:", casLogoutUrl);  // Kiểm tra URL logout

        // Gửi yêu cầu logout đến CAS
        await fetch(casLogoutUrl, {
            method: 'GET',
        });
    } catch (error) {
        console.error('Lỗi khi logout CAS:', error);
    }
};

export const logout = async (refreshToken) => {
    const storedPassword = await AsyncStorage.getItem('password');

    if (storedPassword === 'loginWithCas') { 
        await handleLogoutCAS();
    }
    await AsyncStorage.clear();
    console.log('Refresh token expired or invalid. Logging out...');
    try {
        await axios.delete(tokenRoute.deleteToken, {
            data: { refreshToken },
        });
    } catch (error) {
        console.log(error);
    } finally {
        navigate('Login');
    }
};

const refreshAccessToken = async (refreshToken) => {
    //const refreshToken = await AsyncStorage.getItem('refreshToken');
    //console.log(refreshToken);
    try {
        const response = await axios.post(tokenRoute.refreshToken, { refreshToken });
        if (response.status >= 200 && response.status < 300) {
            await AsyncStorage.setItem('accessToken', response.data.accessToken);
            await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
            return response.data.accessToken;
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            await logout(refreshToken);
        } else {
            console.error('Error refreshing access token:', error);
            throw error;
        }
    }
};

let isRefreshing = false;
let refreshSubscribers = [];

// Hàm xử lý các yêu cầu chờ đợi token mới
const onRefreshed = (newToken) => {
    refreshSubscribers.map((callback) => callback(newToken));
    refreshSubscribers = [];
};

// Hàm để đăng ký các yêu cầu cần đợi token mới
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

// Kiểm tra access token có hết hạn chưa
axiosInstance.interceptors.request.use(
    async (config) => {
        let accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        try {
            if (accessToken) {
                // Kiểm tra xem token có hết hạn hay không
                const token = accessToken.split(' ')[1];
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                // Nếu token đã hết hạn
                if (decodedToken.exp < currentTime) {
                    if (!isRefreshing) {
                        isRefreshing = true;
                        accessToken = await refreshAccessToken(refreshToken);
                        isRefreshing = false;
                        // Gọi tất cả các yêu cầu bị treo trong khi token đang làm mới
                        //console.log("axios",accessToken)
                        onRefreshed(accessToken);
                    } else {
                        // Tạo một Promise để các yêu cầu đợi cho đến khi token mới được tạo
                        return new Promise((resolve) => {
                            subscribeTokenRefresh((newToken) => {
                                config.headers['Authorization'] = `Bearer ${newToken}`;
                                resolve(config);
                            });
                        });
                    }
                }

                config.headers['Authorization'] = `Bearer ${accessToken}`;
            } else {
                await logout(refreshToken);
            }

            // Thêm header X-Don-Vi vào tất cả các request
            const currentDb = await AsyncStorage.getItem('currentDatabase');
            config.headers['X-Don-Vi'] = currentDb || '';
        } catch (error) {
            console.error('Error in request interceptor:', error);
            await logout(refreshToken);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
