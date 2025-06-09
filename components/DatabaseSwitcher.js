import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, FlatList, DeviceEventEmitter } from 'react-native';
import { Text } from 'react-native-paper';
import { switchDatabase, getCurrentDatabase, setCurrentDatabase } from '../utils/databaseConfig';
import axios from 'axios';
import { donViRoute } from '../api/baseURL';
import Toast from 'react-native-toast-message';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faServer, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const DatabaseSwitcher = () => {
    const [currentDb, setCurrentDb] = useState('');
    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const loadCurrentDatabase = async () => {
            const db = await getCurrentDatabase();
            setCurrentDb(db);
        };
        loadCurrentDatabase();
    }, []);

    const handleSwitchDatabase = async (donVi) => {
        if (donVi === currentDb) return; // Không làm gì nếu chọn lại chính nó
        try {
            const success = await switchDatabase(donVi);
            if (success) {
                await setCurrentDatabase(donVi);
                setCurrentDb(donVi);
                setIsOpen(false);
                // Emit event khi database thay đổi
                DeviceEventEmitter.emit('databaseChanged');
                Toast.show({
                    type: 'success',
                    text1: `Đã chuyển sang database ${donVi}`,
                    position: 'top',
                    visibilityTime: 3000,
                });
                // Reload app để áp dụng database mới
                setTimeout(() => {
                    // Có thể thêm logic reload app ở đây
                }, 500);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Không thể chuyển đổi database',
                    position: 'top',
                    visibilityTime: 3000,
                });
            }
        } catch (error) {
            console.error('Lỗi khi chuyển đổi database:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi khi chuyển đổi database',
                position: 'top',
                visibilityTime: 3000,
            });
        }
    };

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await axios.get(donViRoute.findAll);
                if (res.status >= 200 && res.status < 300) {
                    setOptions(res.data.filter(item => item.id > 1)); // Loại bỏ All khỏi danh sách
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Không thể tải danh sách đơn vị',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                }
            } catch (error) {
                console.error('Lỗi khi tải danh sách đơn vị:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi khi tải danh sách đơn vị',
                    position: 'top',
                    visibilityTime: 3000,
                });
            }
        };
        fetchOptions();
    }, []);

    return (
        <View className="relative">
            <TouchableOpacity
                onPress={() => setIsOpen(!isOpen)}
                className="flex flex-row items-center justify-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100"
            >
                <FontAwesomeIcon icon={faServer} size={20} color="#3b82f6" />
                <Text className="text-blue-700 font-medium">{currentDb}</Text>
                <FontAwesomeIcon 
                    icon={faChevronDown} 
                    size={16} 
                    color="#3b82f6"
                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity 
                    className="flex-1 bg-black/50 justify-center items-center"
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View className="bg-white rounded-lg p-2 w-4/5 max-h-[60%] shadow-lg">
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.maDonVi}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`py-3 px-4 ${item.maDonVi === currentDb ? 'bg-blue-50' : ''}`}
                                    onPress={() => handleSwitchDatabase(item.maDonVi)}
                                >
                                    <Text className={`${item.maDonVi === currentDb ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                                        {item.maDonVi}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default DatabaseSwitcher; 