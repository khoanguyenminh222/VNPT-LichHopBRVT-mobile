// context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import { logout } from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userAllowedUrls, setUserAllowedUrls] = useState([]);

    const updateUser = (newUserData, allowedUrls) => {
        setUser(newUserData);
        setUserAllowedUrls(allowedUrls);
    };

    const isLogin = () => {
        return user !== null;
    };

    const logoutSystem = async () => {
        setUser(null);
        setUserAllowedUrls([]);
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        logout(refreshToken);
    }

    return (
        <AuthContext.Provider value={{ user, userAllowedUrls, updateUser, logoutSystem, isLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
