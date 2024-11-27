import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';

// Tạo context để quản lý từ cần highlight
const HighlightTextContext = createContext();

export const HighlightTextProvider = ({ children }) => {
    const [highlightText, setHighlightText] = useState('');

    useEffect(() => {
        const loadHighlightText = async () => {
            try {
                const storedText = await AsyncStorage.getItem('highlightText');
                if (storedText) {
                    setHighlightText(storedText);
                }
            } catch (error) {
                console.error('Failed to load highlight text from storage', error);
            }
        };

        loadHighlightText();
    }, []);

    return (
        <HighlightTextContext.Provider value={{ highlightText, setHighlightText }}>
            {children}
        </HighlightTextContext.Provider>
    );
};

export const useHighlightText = () => useContext(HighlightTextContext);