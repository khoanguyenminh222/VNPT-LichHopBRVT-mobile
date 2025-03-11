import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';

// Tạo context cho cỡ chữ
const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState(14);

    useEffect(() => {
        // Lấy cỡ chữ từ storage nếu đã lưu
        const loadFontSize = async () => {
            try {
                const storedFontSize = await AsyncStorage.getItem('fontSize');
                if (storedFontSize) {
                    setFontSize(Number(storedFontSize));
                }
            } catch (error) {
                console.error('Failed to load font size from storage', error);
            }
        };

        loadFontSize();
    }, []);

    return (
        <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
            {children}
        </FontSizeContext.Provider>
    );
};

export const useFontSize = () => useContext(FontSizeContext);
