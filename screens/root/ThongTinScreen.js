import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const ThongTinScreen = () => {
    const { logoutSystem } = useAuth();

    const handleLogout = async () => {
        await AsyncStorage.clear();
        logoutSystem();
        Toast.show({
            type: 'success',
            text1: 'Đăng xuất thành công',
            position: 'top',
            visibilityTime: 3000,
        });
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Pressable onPress={handleLogout} className="py-2 px-4 mt-2 rounded-md bg-blue-500 hover:bg-blue-600">
                <Text className="text-white">Đăng xuất</Text>
            </Pressable>
        </View>
    );
};

export default ThongTinScreen;
