import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

const NotFoundScreen = ({ navigation }) => {

    const handleGoBack = () => {
        navigation.navigate('Root');
    };

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-red-500 text-lg mb-4">Bạn không có quyền truy cập vào trang này.</Text>
            <TouchableOpacity 
                className="bg-blue-500 rounded px-4 py-2"
                onPress={handleGoBack}
            >
                <Text className="text-white text-center">Quay lại</Text>
            </TouchableOpacity>
        </View>
    );
};

export default NotFoundScreen;
