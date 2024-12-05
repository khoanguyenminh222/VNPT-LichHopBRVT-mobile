import { View, Text, ScrollView, Image, Platform } from 'react-native';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const ThongTinFakeScreen = () => {
    return (
        <View className="flex-1 bg-gray-100" style={{marginTop: Platform.OS === 'android' ? 25 : 0}}>
            {/* Header */}
            <View className="bg-blue-600 p-6 shadow-lg">
                <Text className="text-3xl font-bold text-center text-white">Giới Thiệu VNPT BRVT</Text>
            </View>

            {/* Nội dung */}
            <ScrollView className="p-4 space-y-6">
                {/* Ảnh và giới thiệu */}
                <View className="bg-white p-4 rounded-lg shadow-md">
                    <Image
                        source={require('../assets/logoTextVnpt.png')}
                        className="w-full h-40 object-contain"
                        resizeMode="contain"
                    />
                    <Text className="text-lg font-semibold text-gray-800 mt-4">
                        VNPT BRVT - Đơn vị hàng đầu trong lĩnh vực viễn thông và công nghệ thông tin.
                    </Text>
                    <Text className="text-gray-600 mt-2">
                        VNPT BRVT (Bà Rịa - Vũng Tàu) tự hào là nhà cung cấp dịch vụ viễn thông và công nghệ thông tin hàng đầu tại khu vực. Với đội ngũ chuyên gia giàu kinh nghiệm, chúng tôi cam kết mang đến giải pháp hiện đại, tối ưu, góp phần thúc đẩy sự phát triển kinh tế - xã hội của tỉnh nhà.
                    </Text>
                </View>

                {/* Thông tin ứng dụng lịch họp */}
                <View className="bg-white p-4 rounded-lg shadow-md">
                    <Text className="text-xl font-bold text-blue-600">Ứng Dụng Lịch Họp</Text>
                    <Text className="text-gray-600 mt-2">
                        Ứng dụng Lịch họp được phát triển bởi đội ngũ của VNPT BRVT nhằm hỗ trợ quản lý và tổ chức các cuộc họp một cách dễ dàng, tiện lợi. Với các tính năng thông minh, ứng dụng giúp:
                    </Text>
                    <Text className="text-gray-600 mt-4">
                        - Lên lịch họp chi tiết với thông tin thời gian, địa điểm rõ ràng.
                    </Text>
                    <Text className="text-gray-600">
                        - Gửi thông báo tự động tới người tham dự.
                    </Text>
                    <Text className="text-gray-600">
                        - Quản lý danh sách các cuộc họp trong tuần hoặc tháng.
                    </Text>
                </View>

                {/* Cam kết */}
                <View className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 flex-row items-start space-x-8 my-10">
                    {/* Biểu tượng minh họa */}
                    <View className="bg-blue-500 p-2 rounded-full mr-4">
                        <FontAwesomeIcon icon={faCheckCircle} color='white'/>
                    </View>

                    {/* Nội dung */}
                    <View className="flex-1">
                        <Text className="text-xl font-bold text-gray-800">Cam Kết</Text>
                        <Text className="text-gray-600 mt-2">
                            VNPT BRVT cam kết đồng hành cùng khách hàng trong việc mang đến các giải pháp công nghệ hiện đại nhất. Chúng tôi không ngừng cải tiến để tạo nên những sản phẩm mang tính đột phá, phục vụ tốt nhất cho công việc và cuộc sống.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="bg-gray-100 p-4 border-t border-gray-300">
                <Text className="text-center text-gray-500 text-sm">© 2024 VNPT BRVT.</Text>
            </View>
        </View>
    );
};

export default ThongTinFakeScreen;
