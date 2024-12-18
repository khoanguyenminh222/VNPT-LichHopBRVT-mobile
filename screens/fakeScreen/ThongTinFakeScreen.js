import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Platform, Switch } from 'react-native';
import { FakeIOSContext } from '../../context/FakeIOSContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPalette, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { Dropdown } from 'react-native-element-dropdown';

const ThongTinFakeScreen = () => {
    const { isDarkMode, setIsDarkMode, fontSize, setFontSize } = useContext(FakeIOSContext);

    const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 30));
    const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 12));

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
                padding: 16,
                marginTop: Platform.OS === 'android' ? 25 : 0,
            }}
        >
            {/* Header */}
            <View
                style={{
                    padding: 16,
                    //backgroundColor: isDarkMode ? '#1e1e1e' : '#4f46e5',
                    borderRadius: 10,
                    marginBottom: 20,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                }}
            >
                <Text
                    style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: isDarkMode ? '#fff' : '#000',
                    }}
                >
                    Thiết lập
                </Text>
            </View>

            {/* Chuyển đổi chế độ sáng/tối */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesomeIcon
                        icon={isDarkMode ? faMoon : faSun}
                        size={20}
                        color={isDarkMode ? '#fff' : '#000'}
                        style={{ marginRight: 10 }}
                    />
                    <Text style={{ fontSize: 16, color: isDarkMode ? '#fff' : '#000' }}>
                        Chế độ {isDarkMode ? 'Tối' : 'Sáng'}
                    </Text>
                </View>
                <Switch value={isDarkMode} onValueChange={() => setIsDarkMode((prev) => !prev)} />
            </View>

            {/* Văn bản xem trước */}
            <View
                style={{
                    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
                    padding: 20,
                    borderRadius: 10,
                    marginBottom: 20,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                }}
            >
                <Text
                    style={{
                        fontSize: fontSize,
                        color: isDarkMode ? '#fff' : '#000',
                        textAlign: 'center',
                    }}
                >
                    Đây là văn bản mẫu! Bạn có thể thay đổi kích thước của nó.
                </Text>
            </View>

            {/* Điều chỉnh cỡ chữ */}
            <View
                style={{
                    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
                    padding: 20,
                    borderRadius: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                }}
            >
                <Text
                    style={{
                        textAlign: 'center',
                        marginBottom: 16,
                        fontSize: 16,
                        color: isDarkMode ? '#ccc' : '#666',
                    }}
                >
                    Cỡ chữ hiện tại: {fontSize}px
                </Text>

                {/* Nút tăng/giảm cỡ chữ */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
                    <TouchableOpacity
                        style={{
                            padding: 12,
                            borderRadius: 8,
                            backgroundColor: isDarkMode ? '#b91c1c' : '#ef4444',
                        }}
                        onPress={decreaseFontSize}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Giảm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            padding: 12,
                            borderRadius: 8,
                            backgroundColor: isDarkMode ? '#15803d' : '#22c55e',
                        }}
                        onPress={increaseFontSize}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tăng</Text>
                    </TouchableOpacity>
                </View>

                {/* Dropdown chỉnh cỡ chữ */}
                <Dropdown
                    label="Chọn cỡ chữ"
                    data={[...Array(19).keys()].map((i) => {
                        const value = i + 12; // Giá trị từ 12 đến 30
                        return { label: `${value}px`, value: value };
                    })}
                    value={fontSize}
                    labelField="label"
                    valueField="value"
                    onChange={(itemValue) => setFontSize(itemValue.value)}
                    style={{
                        borderRadius: 8,
                        padding: 12,
                        backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
                        color: isDarkMode ? '#fff' : '#000',
                    }}
                />
            </View>
        </View>
    );
};

export default ThongTinFakeScreen;
