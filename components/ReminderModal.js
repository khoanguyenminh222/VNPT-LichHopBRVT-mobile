import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

const ReminderModal = ({ visible, onClose, onSelectReminder, event }) => {
    const [selectedReminder, setSelectedReminder] = useState(null);

    const handleSelectReminder = (value) => {
        setSelectedReminder(value);
    };

    const handleSaveReminder = () => {
        if (selectedReminder !== null) {
            onSelectReminder(event, selectedReminder);
            onClose(); // Close the modal after saving the reminder
        }
    };

    const reminderOptions = [
        { label: '5 phút', value: 5 },
        { label: '10 phút', value: 10 },
        { label: '15 phút', value: 15 },
        { label: '30 phút', value: 30 },
        { label: '45 phút', value: 45 },
        { label: '60 phút', value: 60 },
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View className="bg-white p-6 rounded-lg w-80 shadow-xl">
                    <Text className="text-xl font-semibold text-center mb-6 text-blue-600">Chọn phút nhắc nhở</Text>
                    <View className="space-y-3">
                        {reminderOptions.map((option) => (
                            <Pressable
                                key={option.value}
                                onPress={() => handleSelectReminder(option.value)}
                                className="flex-row items-center p-3 rounded-lg"
                            >
                                <View
                                    className={`w-5 h-5 rounded-full border-2 mr-3 ${selectedReminder === option.value ? 'bg-blue-500 border-blue-500' : 'bg-white'}`}
                                />
                                <Text className="text-lg text-black">
                                    {option.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <Pressable
                        onPress={onClose}
                        className="mt-6 p-3 bg-red-500 rounded-lg"
                    >
                        <Text className="text-white text-center text-lg">Đóng</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleSaveReminder}
                        className="mt-4 p-3 bg-blue-500 rounded-lg"
                    >
                        <Text className="text-white text-center text-lg">Lưu</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default ReminderModal;