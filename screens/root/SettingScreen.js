import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFontSize } from '../../context/FontSizeContext';
import { Picker } from '@react-native-picker/picker';
import { useHighlightText } from '../../context/HighlightTextContext';
import { Button, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingScreen = () => {
    const { fontSize, setFontSize } = useFontSize();
    const { setHighlightText } = useHighlightText(); // Lấy setHighlightText từ context
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        const loadHighlightText = async () => {
            try {
                const storedText = await AsyncStorage.getItem('highlightText');
                if (storedText) {
                    setInputText(storedText);
                }
            } catch (error) {
                console.error('Failed to load highlight text from storage', error);
            }
        };

        loadHighlightText();
    }, []);

    // Hàm lưu từ cần highlight vào context
    const handleHighlightChange = async () => {
        await AsyncStorage.setItem('highlightText', inputText);
        setHighlightText(inputText);
        Toast.show({
            type: 'success',
            text1: 'Đã lưu từ cần highlight',
            position: 'top',
            visibilityTime: 3000,
        });
    };
    return (
        <ScrollView className="flex-1 p-6 bg-gray-200">
            <View className="mb-8 p-6 bg-white rounded-lg w-full max-w-[460px] m-auto">
                <Text className="text-3xl font-bold text-center text-gray-800 mb-4">Cài đặt cỡ chữ</Text>
                <Text className="text-lg font-medium text-gray-700 mb-2">Chọn cỡ chữ</Text>
                <Picker
                    selectedValue={fontSize}
                    onValueChange={async (itemValue) => { setFontSize(itemValue); await AsyncStorage.setItem('fontSize', itemValue.toString()) }}
                    style={{ width: '100%' }}
                >
                    <Picker.Item label="14" value={14} />
                    <Picker.Item label="15" value={15} />
                    <Picker.Item label="16" value={16} />
                    <Picker.Item label="17" value={17} />
                    <Picker.Item label="18" value={18} />
                    <Picker.Item label="19" value={19} />
                    <Picker.Item label="20" value={20} />
                </Picker>
                <Text style={{ fontSize: Number(fontSize) }} className="text-gray-800 font-semibold mt-4">Cỡ chữ hiện tại: <Text className="text-blue-600">{fontSize}</Text></Text>
            </View>
            <View className="my-8 p-6 bg-white rounded-lg w-full max-w-[460px] m-auto">
                <Text className="text-3xl font-bold text-center text-gray-800 mb-4">Cài đặt Highlight</Text>
                {/* Input để người dùng nhập từ cần highlight */}
                <TextInput
                    value={inputText}
                    onChangeText={(text) => setInputText(text)}
                    placeholder="Nhập từ cần highlight"
                    style={{
                        borderBottomWidth: 1,
                        marginBottom: 20,
                        padding: 10,
                    }}
                />

                {/* Nút để lưu từ cần highlight */}
                <Button mode='contained' onPress={handleHighlightChange}>Lưu</Button>
            </View>
        </ScrollView>
    );
};

export default SettingScreen;
