import { faClock, faLocationPin } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import Constants from 'expo-constants';

const LichHopFakeScreen = () => {
    const [meetings, setMeetings] = useState([
        {
            title: "Họp phát triển dự án",
            time: "9:00 - 11:00, Thứ Hai",
            location: "Phòng họp A",
        },
        {
            title: "Họp kế hoạch tài chính",
            time: "14:00 - 16:00, Thứ Tư",
            location: "Phòng họp B",
        },
        {
            title: "Đánh giá tiến độ công việc",
            time: "10:00 - 12:00, Thứ Sáu",
            location: "Phòng họp C",
        },
    ]);

    const [newMeeting, setNewMeeting] = useState({ title: '', time: '', location: '' });

    const handleAddMeeting = () => {
        if (!newMeeting.title || !newMeeting.time || !newMeeting.location) {
            Alert.alert("Thông báo", "Vui lòng nhập đủ thông tin.");
            return;
        }
        setMeetings([...meetings, newMeeting]);
        setNewMeeting({ title: '', time: '', location: '' });
    };

    const handleDeleteMeeting = (index) => {
        setMeetings(meetings.filter((_, i) => i !== index));
    };

    const handleEditMeeting = (index) => {
        const meetingToEdit = meetings[index];
        Alert.prompt(
            "Chỉnh sửa thông tin",
            "Vui lòng nhập thông tin mới",
            [
                {
                    text: "Hủy",
                    style: "cancel",
                },
                {
                    text: "Lưu",
                    onPress: (newTitle) => {
                        const updatedMeetings = meetings.map((item, i) =>
                            i === index ? { ...meetingToEdit, title: newTitle } : item
                        );
                        setMeetings(updatedMeetings);
                    },
                },
            ],
            "plain-text",
            meetingToEdit.title
        );
    };

    // Lấy phiên bản từ Constants.manifest.version
    const appVersion = Constants.expoConfig?.version || 'Unknown';

    return (
        <View className="flex-1 bg-gray-100" style={{ marginTop: Platform.OS === 'android' ? 25 : 0 }}>
            {/* Header */}
            <View className="bg-blue-600 p-6 shadow-lg">
                <Text className="text-3xl font-bold text-center text-white">Lịch họp</Text>
            </View>

            {/* Nội dung lịch họp */}
            <ScrollView className="p-4 space-y-6">
                {meetings.map((meeting, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        className="p-1 rounded-lg mt-4 border"
                    >
                        <View className="bg-white p-4 rounded-lg">
                            <Text className="text-lg font-semibold text-gray-800">{meeting.title}</Text>
                            <Text className="text-gray-600 mt-2">
                                <FontAwesomeIcon icon={faClock} /> {meeting.time}
                            </Text>
                            <Text className="text-gray-600 mt-1">
                                <FontAwesomeIcon icon={faLocationPin} color="red" /> {meeting.location}
                            </Text>

                            {/* Nút sửa và xoá */}
                            <View className="flex-row mt-4 space-x-2">
                                <TouchableOpacity
                                    onPress={() => handleDeleteMeeting(index)}
                                    className="bg-red-500 p-2 rounded-lg"
                                >
                                    <Text className="text-white text-center">Xoá</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Thêm mới lịch họp */}
                <View className="bg-white p-4 rounded-lg mt-6">
                    <Text className="text-lg font-bold text-gray-800 mb-4">Thêm lịch họp mới</Text>
                    <TextInput
                        placeholder="Tiêu đề"
                        className="border p-2 mb-2 rounded-lg"
                        value={newMeeting.title}
                        onChangeText={(text) => setNewMeeting({ ...newMeeting, title: text })}
                    />
                    <TextInput
                        placeholder="Thời gian"
                        className="border p-2 mb-2 rounded-lg"
                        value={newMeeting.time}
                        onChangeText={(text) => setNewMeeting({ ...newMeeting, time: text })}
                    />
                    <TextInput
                        placeholder="Địa điểm"
                        className="border p-2 mb-2 rounded-lg"
                        value={newMeeting.location}
                        onChangeText={(text) => setNewMeeting({ ...newMeeting, location: text })}
                    />
                    <TouchableOpacity
                        onPress={handleAddMeeting}
                        className="bg-green-500 p-2 rounded-lg"
                    >
                        <Text className="text-white text-center">Thêm</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default LichHopFakeScreen;