import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import WebView from 'react-native-webview';
import { useFontSize } from '../../context/FontSizeContext';

const WebViewBIScreen = ({ navigation, route }) => {
    const { url, name } = route.params;
    const { fontSize } = useFontSize();
    return (
        <View className="flex-1 mt-9 bg-white">
            {/* Nút back quay lại*/}
            <View className="p-4 shadow-md flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-blue-500">{'<'} Quay lại</Text>
                </TouchableOpacity>
            </View>
            <Text className="font-bold text-center px-4 mb-2" style={{ fontSize: fontSize }}>
                {name}
            </Text>
            <WebView
                source={{ uri: url }}
                style={{ flex: 1, marginBottom: Platform.OS == 'ios' ? 30 : 0 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('HTTP error: ', nativeEvent);
                }}
            />
        </View>
    );
};

export default WebViewBIScreen;