import { faClock, faLocationPin, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { FakeIOSContext } from '../context/FakeIOSContext';

const LichHopFakeScreen = () => {
    const { isDarkMode, fontSize } = useContext(FakeIOSContext);
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
    const [editingIndex, setEditingIndex] = useState(null);
    const [searchText, setSearchText] = useState('');

    const handleAddOrUpdateMeeting = () => {
        if (!newMeeting.title || !newMeeting.time || !newMeeting.location) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (editingIndex !== null) {
            const updatedMeetings = [...meetings];
            updatedMeetings[editingIndex] = newMeeting;
            setMeetings(updatedMeetings);
            setEditingIndex(null);
        } else {
            setMeetings([...meetings, newMeeting]);
        }

        setNewMeeting({ title: '', time: '', location: '' });
    };

    const handleEditMeeting = (index) => {
        setNewMeeting(meetings[index]);
        setEditingIndex(index);
    };

    const handleDeleteMeeting = (index) => {
        Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa cuộc họp này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                onPress: () => setMeetings(meetings.filter((_, i) => i !== index)),
                style: "destructive",
            },
        ]);
    };

    const filteredMeetings = meetings.filter(
        (meeting) =>
            meeting.title.toLowerCase().includes(searchText.toLowerCase()) ||
            meeting.time.toLowerCase().includes(searchText.toLowerCase()) ||
            meeting.location.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <View
            className="flex-1"
            style={{
                backgroundColor: isDarkMode ? '#121212' : '#f9f9f9',
                marginTop: Platform.OS === 'android' ? 25 : 0,
            }}
        >
            {/* Header */}
            <View
                className="p-6 shadow-lg"
                style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#4f46e5' }}
            >
                <Text
                    className="text-3xl font-bold text-center"
                    style={{ color: isDarkMode ? '#fff' : '#fff', fontSize }}
                >
                    Lịch họp
                </Text>
                <TextInput
                    placeholder="Tìm kiếm lịch họp..."
                    placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                    value={searchText}
                    onChangeText={(text) => setSearchText(text)}
                    className="mt-3 p-2 rounded-lg"
                    style={{
                        backgroundColor: isDarkMode ? '#333' : '#fff',
                        color: isDarkMode ? '#fff' : '#000',
                    }}
                />
            </View>

            {/* Danh sách lịch họp */}
            <ScrollView className="p-4 space-y-6 mb-4">
                {/* Form thêm/sửa cuộc họp */}
                <View className="p-4 border-t" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }}>
                    <TextInput
                        placeholder="Tiêu đề cuộc họp"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                        value={newMeeting.title}
                        onChangeText={(text) => setNewMeeting({ ...newMeeting, title: text })}
                        className="mb-3 p-2 rounded-lg"
                        style={{
                            backgroundColor: isDarkMode ? '#333' : '#f1f1f1',
                            color: isDarkMode ? '#fff' : '#000',
                        }}
                    />
                    <TextInput
                        placeholder="Thời gian họp"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                        value={newMeeting.time}
                        onChangeText={(text) => setNewMeeting({ ...newMeeting, time: text })}
                        className="mb-3 p-2 rounded-lg"
                        style={{
                            backgroundColor: isDarkMode ? '#333' : '#f1f1f1',
                            color: isDarkMode ? '#fff' : '#000',
                        }}
                    />
                    <TextInput
                        placeholder="Địa điểm họp"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                        value={newMeeting.location}
                        onChangeText={(text) => setNewMeeting({ ...newMeeting, location: text })}
                        className="mb-3 p-2 rounded-lg"
                        style={{
                            backgroundColor: isDarkMode ? '#333' : '#f1f1f1',
                            color: isDarkMode ? '#fff' : '#000',
                        }}
                    />
                    <TouchableOpacity
                        onPress={handleAddOrUpdateMeeting}
                        className="p-3 rounded-lg"
                        style={{
                            backgroundColor: isDarkMode ? '#4ade80' : '#15803d',
                            alignItems: 'center',
                        }}
                    >
                        <Text className="font-semibold" style={{ color: '#fff', fontSize }}>
                            {editingIndex !== null ? 'Cập nhật' : 'Thêm'}
                        </Text>
                    </TouchableOpacity>
                </View>
                {filteredMeetings.map((meeting, index) => (
                    <View
                        key={index}
                        className="p-4 rounded-lg border my-4"
                        style={{
                            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
                            borderColor: isDarkMode ? '#444' : '#ddd',
                        }}
                    >
                        <Text
                            className="font-semibold"
                            style={{
                                fontSize,
                                color: isDarkMode ? '#fff' : '#000',
                            }}
                        >
                            {meeting.title}
                        </Text>
                        <Text
                            className="mt-2"
                            style={{
                                color: isDarkMode ? '#ccc' : '#555',
                                fontSize: fontSize - 2,
                            }}
                        >
                            <FontAwesomeIcon icon={faClock} /> {meeting.time}
                        </Text>
                        <Text
                            className="mt-1"
                            style={{
                                color: isDarkMode ? '#ccc' : '#555',
                                fontSize: fontSize - 2,
                            }}
                        >
                            <FontAwesomeIcon icon={faLocationPin} color="red" /> {meeting.location}
                        </Text>
                        <View className="flex-row justify-end mt-3 space-x-3">
                            <TouchableOpacity onPress={() => handleEditMeeting(index)}>
                                <FontAwesomeIcon icon={faEdit} color={isDarkMode ? '#4ade80' : '#15803d'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteMeeting(index)}>
                                <FontAwesomeIcon icon={faTrash} color={isDarkMode ? '#f87171' : '#b91c1c'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default LichHopFakeScreen;
