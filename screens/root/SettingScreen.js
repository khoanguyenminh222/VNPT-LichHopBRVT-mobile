import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFontSize } from '../../context/FontSizeContext';
import { Dropdown } from 'react-native-element-dropdown';
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

    const fontSizeOptions = [
        { label: "11", value: 11 },
        { label: "12", value: 12 },
        { label: "13", value: 13 },
        { label: "14", value: 14 },
        { label: "15", value: 15 },
        { label: "16", value: 16 },
        { label: "17", value: 17 },
        { label: "18", value: 18 },
        { label: "19", value: 19 },
        { label: "20", value: 20 },
    ];

    useEffect(() => {
        const loadFontSize = async () => {
            const storedFontSize = await AsyncStorage.getItem("fontSize");
            setFontSize(storedFontSize ? parseInt(storedFontSize, 10) : 14); // Mặc định là 14 nếu không có giá trị
        };
        loadFontSize();
    }, []);

    return (
        <ScrollView className="flex-1 p-4 bg-gray-100">
            <View className="bg-white p-6 rounded-lg w-full max-w-lg mx-auto shadow-md">
                <Text className="text-xl font-bold text-center text-gray-800 mb-4" style={{ fontSize: fontSize + 4 }}>
                    Cài đặt cỡ chữ
                </Text>
                <Text className="text-lg font-medium text-gray-700 mb-2" style={{ fontSize }}>
                    Chọn cỡ chữ
                </Text>
                <Dropdown
                    data={fontSizeOptions}
                    labelField="label"
                    valueField="value"
                    value={fontSize || 14}
                    onChange={async (item) => {
                        setFontSize(item.value);
                        await AsyncStorage.setItem("fontSize", item.value.toString());
                    }}
                    style={{ height: 50, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 10, backgroundColor: "#fff" }}
                    placeholder="Chọn cỡ chữ"
                />
                <Text className="text-gray-800 font-semibold mt-4" style={{ fontSize }}>
                    Cỡ chữ hiện tại: <Text className="text-blue-600">{fontSize}</Text>
                </Text>
            </View>

            <View className="bg-white p-6 rounded-lg w-full max-w-lg mx-auto mt-6 shadow-md">
                <Text className="text-xl font-bold text-center text-gray-800 mb-4" style={{ fontSize: fontSize + 4 }}>
                    Cài đặt Highlight
                </Text>
                <TextInput
                    value={inputText}
                    onChangeText={(text) => setInputText(text)}
                    placeholder="Nhập từ cần highlight"
                    className="border-b border-gray-300 mb-4 p-2"
                    style={{ fontSize }}
                />
                <Button mode="contained" onPress={handleHighlightChange} className="mt-2">
                    <Text className="text-white" style={{ fontSize }}>Lưu</Text>
                </Button>
            </View>
        </ScrollView>
    );
};

export default SettingScreen;
