import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useFontSize } from '../../context/FontSizeContext';
import { Dropdown } from 'react-native-element-dropdown';
import { useHighlightText } from '../../context/HighlightTextContext';
import { Button, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PowerBI from '../../components/PowerBI';
import { TouchableOpacity } from 'react-native';
import hasAccess from '../../utils/permissionsAllowedURL';
import { screenUrls } from '../../api/routes';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { accountRoute } from '../../api/baseURL';
import { useIsFocused } from '@react-navigation/native';

const SettingScreen = ({ navigation }) => {
    const { user, userAllowedUrls } = useAuth();
    const { fontSize, setFontSize } = useFontSize();
    const { setHighlightText } = useHighlightText(); // Lấy setHighlightText từ context
    const [inputText, setInputText] = useState('');
    const [loadingLinkBI, setLoadingLinkBI] = useState(false);
    const isFocused = useIsFocused();
    const fetchSettingLinkBI = async () => {
        try {
            const response = await axiosInstance.get(accountRoute.findByUsername+"/linkbi");
            if (response.status >= 200 && response.status < 300) {
                if (response.data.trangThai === 0) { // Trạng thái linkBI không hoạt động thì không có có màn hình Link BI
                    setLoadingLinkBI(false);
                } else {
                    setLoadingLinkBI(true);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    useEffect(() => {
        if (isFocused) {
            // Gọi API lần đầu khi màn hình được focus
            fetchSettingLinkBI();

            // Tự động gọi API sau mỗi 5 giây
            const interval = setInterval(() => {
                fetchSettingLinkBI();
            }, 5000);

            // Dọn dẹp interval khi màn hình mất focus
            return () => clearInterval(interval);
        }
    }, [isFocused]);

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
        { label: "09", value: 9 },
        { label: "10", value: 10 },
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

            {(hasAccess(screenUrls.LinkBI, userAllowedUrls) || user?.vaiTro == 'admin') && loadingLinkBI &&
                <View className="bg-white mb-6 p-6 rounded-lg w-full max-w-lg mx-auto shadow-sm">
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-4 uppercase" style={{ fontSize: fontSize + 4 }}>
                        GIÁM SÁT SẢN XUẤT KINH DOANH
                    </Text>
                    <PowerBI navigation={navigation} fontSize={fontSize} />
                </View>
            }
            <View className="bg-white p-6 rounded-lg w-full max-w-lg mx-auto shadow-sm">
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

            <View className="bg-white p-6 rounded-lg w-full max-w-lg mx-auto my-6 shadow-sm">
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
