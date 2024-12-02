import { faClock, faLocationPin } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Constants from 'expo-constants';

const LichHopFakeScreen = () => {
    const fakeMeetings = [
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
    ];
    // Lấy phiên bản từ Constants.manifest.version
    const appVersion = Constants.expoConfig?.version || 'Unknown';
    return (
        <View className="flex-1 bg-gray-100" style={{marginTop: Platform.OS === 'android' ? 25 : 0}}>
            {/* Header */}
            <View className="bg-blue-600 p-6 shadow-lg">
                <Text className="text-3xl font-bold text-center text-white">Lịch họp</Text>
            </View>

            {/* Nội dung lịch họp */}
            <ScrollView className="p-4 space-y-6">
                {fakeMeetings.map((meeting, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        className="p-1 rounded-lg mt-4 border"
                    >
                        <View className="bg-white p-4 rounded-lg">
                            <Text className="text-lg font-semibold text-gray-800">{meeting.title}</Text>
                            <Text className="text-gray-600 mt-2"><FontAwesomeIcon icon={faClock}/>{meeting.time}</Text>
                            <Text className="text-gray-600 mt-1"><FontAwesomeIcon icon={faLocationPin} color='red'/>{meeting.location}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Footer */}
            <View className="absolute bottom-6 left-0 right-0 px-6">
                <View className="bg-gray-100 p-4 border-t border-gray-300 rounded-lg">
                    <Text className="text-center text-gray-500 text-sm">
                        Ứng dụng lịch họp {appVersion}
                    </Text>
                    <Text className="text-center text-gray-500 text-sm mt-1">
                        Phát triển bởi: <Text className="font-semibold text-gray-700">Trung tâm Công nghệ Thông tin - Viễn thông Bà Rịa - Vũng Tàu</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default LichHopFakeScreen;
