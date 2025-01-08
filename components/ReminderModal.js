import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native';

const ReminderModal = ({ visible, onClose, onSelectReminder, event }) => {
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null); // Thời gian đếm ngược

    // Khi modal mở, thiết lập selectedReminder từ event nếu có
    useEffect(() => {
        if (event && event.nhacNho) {
            setSelectedReminder(event.nhacNho);
        } else {
            setSelectedReminder(null);
        }
    }, [event, visible]);

    // Hàm tính toán thời gian còn lại
    const calculateTimeLeft = () => {
        if (event && event.ngayBatDau && event.gioBatDau && event.nhacNho) {
            // Tính thời gian bắt đầu sự kiện
            const eventDateTime = new Date(`${event.ngayBatDau}T${event.gioBatDau}`);

            // Tính thời gian nhắc nhở
            const reminderTime = new Date(eventDateTime.getTime() - event.nhacNho * 60000); // Trừ nhắc nhở (minutes)

            const currentTime = new Date(); // Lấy thời gian hiện tại
            const timeDifference = reminderTime - currentTime; // Tính toán sự khác biệt thời gian

            if (timeDifference <= 0) {
                return 0; // Nếu thời gian nhắc nhở đã qua
            }
            return timeDifference; // Trả lại thời gian còn lại
        }
        return 0;
    };

    useEffect(() => {
        if (!visible) return; // Nếu modal không mở, không thực hiện gì

        // Cập nhật thời gian còn lại mỗi giây
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Dừng interval khi component bị unmount hoặc khi modal đóng
        return () => clearInterval(interval);
    }, [visible, event]); // Chạy lại mỗi khi modal mở hoặc sự kiện thay đổi

    // Hiển thị giờ, phút, giây còn lại
    const formatTimeLeft = (timeInMilliseconds) => {
        const hours = Math.floor(timeInMilliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((timeInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeInMilliseconds % (1000 * 60)) / 1000);

        return `${hours} giờ ${minutes} phút ${seconds} giây`;
    };

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
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View className="bg-white p-6 rounded-lg w-80 shadow-xl">
                            <Text className="text-xl font-semibold text-center mb-6 text-blue-600">Chọn phút nhắc nhở</Text>
                            <View className="space-y-3">
                                {event?.nhacNho && (
                                    timeLeft > 0 ? (
                                        <Text className="text-red-500 px-3">
                                            Còn lại: {formatTimeLeft(timeLeft)}
                                        </Text>
                                    ) : (
                                        <Text className="text-red-500 px-3">
                                            Đã quá thời gian nhắc nhở
                                        </Text>
                                    )
                                )}
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
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ReminderModal;