import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { ScrollView } from 'react-native-gesture-handler';

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
        <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-1 justify-center items-center bg-gray-100 py-6">
                {/* App information */}
                <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center mb-4">
                    <Text className="text-2xl font-semibold text-blue-600 text-center">Ứng dụng tra cứu lịch họp VNPT</Text>
                    <Text className="text-lg text-gray-500 mt-10 text-center">Được phát triển bởi Trung tâm Công nghệ Thông tin - Viễn thông Bà Rịa - Vũng Tàu</Text>
                    <Text className="text-gray-500 mt-16 text-center">Phiên bản: 1.0.0</Text>
                </View>

                {/* Logout button */}
                <Pressable onPress={handleLogout} className="py-3 px-6 bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 mt-4 justify-end items-end">
                    <Text className="text-white text-lg font-semibold">Đăng xuất</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
};

export default ThongTinScreen;
