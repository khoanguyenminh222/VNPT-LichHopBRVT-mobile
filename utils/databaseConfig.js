import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosInstance';
import { authRoute } from '../api/baseURL';


// Function to switch database
export const switchDatabase = async (donVi) => {
    console.log("Switching to database:", donVi);
    try {
        // Assuming your backend has a mobile-compatible endpoint or the existing one works
        const response = await axiosInstance.post(authRoute.switchOrganization, { donVi });
        if (response.status >= 200 && response.status < 300) {
            // Save to AsyncStorage after successful API call
            await AsyncStorage.setItem("currentDatabase", donVi);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error switching database:', error);
        return false;
    }
};

// Function to get current database
export const getCurrentDatabase = async () => {
    try {
        // Get from AsyncStorage
        const currentDb = await AsyncStorage.getItem('currentDatabase');
        return currentDb || '';
    } catch (error) {
        console.error('Error getting database info:', error);
        return '';
    }
};

// Function to set current database
export const setCurrentDatabase = async (donVi) => {
    try {
        // Save to AsyncStorage
        await AsyncStorage.setItem('currentDatabase', donVi);
    } catch (error) {
        console.error('Error saving database to AsyncStorage:', error);
    }
};