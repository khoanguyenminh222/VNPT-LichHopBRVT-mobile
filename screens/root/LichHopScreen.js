import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import axiosInstance from '../../utils/axiosInstance';
import { eventRoute, publicfolder } from '../../api/baseURL';
import Toast from 'react-native-toast-message';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';
import { PanGestureHandler, State, ScrollView, RefreshControl } from 'react-native-gesture-handler';
import { faClipboard, faClockFour } from '@fortawesome/free-solid-svg-icons';
import ReminderModal from '../../components/ReminderModal';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const LichHopScreen = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentWeekIndex, setCurrentWeekIndex] = useState(1);
    const [events, setEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hàm hỗ trợ để lấy ngày bắt đầu và ngày kết thúc của tuần hiện tại
    const getWeekDates = (date) => {
        const startDate = new Date(date);
        const startDay = startDate.getDay();
        const diff = startDay >= 1 ? startDay - 1 : 6;
        startDate.setDate(startDate.getDate() - diff);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const newDate = new Date(startDate);
            newDate.setDate(startDate.getDate() + i);
            days.push(newDate);
        }

        return days;
    };

    // Hàm hỗ trợ để lấy tất cả các ngày trong khoảng thời gian sự kiện
    const getEventDays = (ngayBatDau, ngayKetThuc) => {
        const startDate = new Date(ngayBatDau);
        const endDate = new Date(ngayKetThuc);
        const days = [];

        for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
            days.push(new Date(currentDate));
        }

        return days;
    };

    // Hàm lấy ra event từ server
    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get(eventRoute.findAll);
            setEvents(response.data);
        } catch (error) {
            console.log('Failed to fetch events:', error);
            const errorMessage = error.response ? error.response.data.message : error.message;
            Toast.show({
                type: 'error',
                text1: errorMessage,
                position: 'top',
                visibilityTime: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchEvents();
    }, []);

    const weekDates = getWeekDates(currentWeek);

    // Hàm lấy ra các sự kiện cho ngày đã chọn
    const getEventsForDate = (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        return events.filter((event) => {
            // Kiểm tra nếu có sự kiện với ngày bắt đầu và kết thúc hợp lệ
            if (!event.ngayBatDau || !event.ngayKetThuc) return false;

            const eventDays = getEventDays(event.ngayBatDau, event.ngayKetThuc);
            return eventDays.some(eventDay => eventDay.toISOString().split('T')[0] === formattedDate);
        });
    };

    // Hàm xử lý khi chuyển đến tuần tiếp theo
    const handleNextWeek = () => {
        if (currentWeekIndex < 2) {
            const nextWeek = new Date(currentWeek);
            nextWeek.setDate(nextWeek.getDate() + 7);
            setCurrentWeek(nextWeek);
            setCurrentWeekIndex(2);

            const nextWeekDates = getWeekDates(nextWeek);

            const focusDate = nextWeekDates[0]; // Focus vào thứ 2 của tuần mới

            setSelectedDate(focusDate);
        }
    };

    // Hàm xử lý khi chuyển về tuần trước
    const handlePreviousWeek = () => {
        if (currentWeekIndex > 1) {
            const previousWeek = new Date(currentWeek);
            previousWeek.setDate(previousWeek.getDate() - 7);
            setCurrentWeek(previousWeek);
            setCurrentWeekIndex(1);

            const previousWeekDates = getWeekDates(previousWeek);

            const focusDate = previousWeekDates[6]; // Focus vào chủ nhật của tuần mới

            setSelectedDate(focusDate);
        }
    };

    // Hàm xử lý khi chọn ngày
    const handleSelectDate = (date) => {
        setSelectedDate(date);
    };

    // Hàm xử lý khi tải file đính kèm
    const handleDownload = (fileUrl) => {
        // Mở liên kết hoặc tải file nếu có
        Linking.openURL(fileUrl).catch(err => console.error("Failed to open URL:", err));
    };

    // Hàm sắp xếp sự kiện chỉ theo giờ bắt đầu
    const sortEventsByStartTime = (events) => {
        return events.sort((a, b) => {
            // Tạo đối tượng Date giả định để so sánh giờ từ '00:00:00' cho mỗi sự kiện
            const timeA = new Date(`1970-01-01T${a.gioBatDau}:00`);
            const timeB = new Date(`1970-01-01T${b.gioBatDau}:00`);

            // So sánh giờ giữa hai sự kiện
            return timeA.getTime() - timeB.getTime();
        });
    };

    // Sắp xếp các sự kiện cho ngày đã chọn
    const sortedEvents = events.length ? sortEventsByStartTime(getEventsForDate(selectedDate)) : [];

    // Chuyển đến ngày tiếp theo
    const handleNextDay = () => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(selectedDate.getDate() + 1);

        // Kiểm tra xem được phép qua tiếp các ngày sau không
        if (nextDate > weekDates[6] && currentWeekIndex === 2) return;
        setSelectedDate(nextDate);
    };

    // Quay lại ngày trước
    const handlePreviousDay = () => {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(selectedDate.getDate() - 1);

        // Kiểm tra xem được phép quay lại các ngày trước không
        if (prevDate < weekDates[0] && currentWeekIndex === 1) return;
        setSelectedDate(prevDate)
    };

    // Xử lý vuốt ngang
    const [translateX, setTranslateX] = useState(0);
    // Xử lý sự kiện vuốt
    const handleGestureEvent = ({ nativeEvent }) => {
        setTranslateX(nativeEvent.translationX);
    };

    // Xử lý khi vuốt
    const handleHandlerStateChange = ({ nativeEvent }) => {
        if (nativeEvent.state === State.END) {
            // Chỉ cập nhật ngày khi vuốt xong
            if (translateX < -50) {
                // Vuốt qua phải: Chuyển sang ngày tiếp theo
                handleNextDay();
            } else if (translateX > 50) {
                // Vuốt qua trái: Chuyển về ngày trước đó
                handlePreviousDay();
            }
            // Reset lại vị trí vuốt sau khi hoàn thành
            setTranslateX(0);
        }
    };

    // Hàm này sẽ xử lý khi có sự thay đổi về selectedDate
    useEffect(() => {
        // Lấy danh sách các ngày trong tuần hiện tại
        const currentWeekDates = getWeekDates(currentWeek);

        // Kiểm tra nếu ngày đã chọn không thuộc tuần hiện tại
        if (!currentWeekDates.some(date => date.toDateString() === selectedDate.toDateString())) {
            // Kiểm tra xem ngày đã chọn có thuộc tuần sau hay tuần trước không
            if (selectedDate < currentWeekDates[0]) {
                handlePreviousWeek();  // Ngày đã chọn nằm trong tuần trước
            } else {
                handleNextWeek();  // Ngày đã chọn nằm trong tuần sau
            }
        }
    }, [selectedDate, currentWeek]);

    // Sao chép nội dung sự kiện
    const handleCopyText = async (event) => {
        const textToCopy = `
            ${event.noiDungCuocHop}
            Địa điểm: ${event.diaDiem}
            Thời gian: ${event.gioBatDau} - ${event.gioKetThuc}
            Chủ trì: ${event.chuTri}
            Chuẩn bị: ${event.chuanBi || 'Không có'}
            Thành phần: ${event.thanhPhan}
            Mời: ${event.moi || 'Không có'}
            Ghi chú: ${event.ghiChu || 'Không có'}
            File đính kèm: ${event.fileDinhKem ? JSON.parse(event.fileDinhKem).join(', ') : 'Không có'}
        `;
        await Clipboard.setStringAsync(textToCopy); // Sao chép vào clipboard
        Toast.show({
            type: 'success',
            text1: 'Sao chép nội dung',
            text2: 'Nội dung đã được sao chép vào clipboard!',
            position: 'top',
            visibilityTime: 3000,
        });
    };

    // // Xử lý khi chọn nhắc nhở
    const handleReminderSelect = async (event, minutes) => {
        // Kiểm tra quyền
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission not granted for notifications');
            return;
        }

        const eventDateTime = new Date(`${event.ngayBatDau}T${event.gioBatDau}`);
        const reminderTime = new Date(eventDateTime.getTime() - minutes * 60 * 1000);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Nhắc nhở họp",
                body: `Cuộc họp của "${event.noiDungCuocHop}" sẽ diễn ra trong ${minutes} phút.`,
                sound: true,
            },
            trigger: { date: reminderTime },
        });

        Toast.show({
            type: 'success',
            text1: 'Đã đặt nhắc nhở',
            text2: `Nhắc nhở sự kiện "${event.noiDungCuocHop}" sẽ được gửi trước ${minutes} phút.`,
            position: 'top',
            visibilityTime: 3000,
        });
        setModalVisible(false);
    };

    // Gọi hàm kiểm tra và yêu cầu quyền khi ứng dụng mở
    useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Cần cấp quyền thông báo để nhận nhắc nhở sự kiện.');
            }
        };
        requestPermissions();
    }, []);

    // Đóng modal nhắc nhở
    const handleModalClose = () => {
        setModalVisible(false);
    };

    // Hàm kiểm tra JSON và trả về mảng file hoặc mảng rỗng
    const parseFileAttachments = (fileDinhKem) => {
        if (typeof fileDinhKem === "string") {
            try {
                const parsed = JSON.parse(fileDinhKem);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.error("JSON parsing error:", error);
                return [];
            }
        }
        return [];
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-blue-600 text-2xl">Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View className="flex-1 bg-gray-50">
                <View className="flex-row justify-between items-center mb-6">
                    <Pressable
                        onPress={handlePreviousWeek}
                        className={currentWeekIndex <= 1 ? "opacity-0 pointer-events-none" : "p-4"}
                    >
                        <Text className="text-2xl text-blue-600">{"<"}</Text>
                    </Pressable>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                        {weekDates.map((item, index) => (
                            <Pressable
                                key={index}
                                onPress={() => handleSelectDate(item)}
                                className={`flex items-center p-3 mx-1 rounded-md ${selectedDate && selectedDate.getDate() === item.getDate() ? 'bg-blue-500' : 'bg-white'}`}
                            >
                                <Text className={`text-base ${selectedDate && selectedDate.getDate() === item.getDate() ? 'text-white font-semibold' : 'text-gray-600'}`}>
                                    {item.toLocaleDateString('vi-VN', { weekday: 'short' })}
                                </Text>
                                <Text className={`text-lg ${selectedDate && selectedDate.getDate() === item.getDate() ? 'text-white font-bold' : 'text-gray-800'}`}>
                                    {item.getDate()}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    <Pressable
                        onPress={handleNextWeek}
                        className={currentWeekIndex >= 2 ? "opacity-0 pointer-events-none" : "p-4"}
                    >
                        <Text className="text-2xl text-blue-600">{">"}</Text>
                    </Pressable>
                </View>
                {/* Hiển thị thứ, ngày  */}
                <Text className="text-2xl text-center text-blue-800 mb-4">{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                <PanGestureHandler
                    onGestureEvent={handleGestureEvent}
                    onHandlerStateChange={handleHandlerStateChange}
                >
                    {selectedDate && (
                        <View className="flex-1 p-4">
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => {
                                            fetchEvents();
                                        }}
                                    />
                                }
                            >
                                {/* Hiển thị danh sách sự kiện trong ngày */}
                                {sortedEvents.map((event, index) => (
                                    <View key={index} className={`${event.trangThai === 'huy' ? 'bg-red-100' : 'bg-blue-100'} p-6 mb-6 rounded-xl shadow-lg border border-blue-300 relative`}>
                                        {/* Tên sự kiện */}
                                        <Text className={`${event.trangThai === 'huy' ? 'text-red-500 line-through' : 'text-blue-900'} font-bold text-2xl mb-2`}>
                                            {event.noiDungCuocHop}
                                        </Text>

                                        {/* Địa điểm */}
                                        <Text className={`${event.trangThai === 'huy' ? 'text-red-500 line-through' : 'text-blue-700'} text-xl mb-2 font-extrabold`}>
                                            {event.diaDiem}
                                        </Text>

                                        {/* Thời gian */}
                                        <Text className={`${event.trangThai === 'huy' ? 'text-red-500 line-through' : 'text-blue-500'} mb-2`}>
                                            Thời gian: <Text className="font-semibold text-xl">{event.gioBatDau} - {event.gioKetThuc}</Text>
                                        </Text>

                                        {/* Chủ trì */}
                                        <Text className={`${event.trangThai === 'huy' ? 'text-red-500 line-through' : 'text-blue-600'} mb-2`}>
                                            Chủ trì: {event.chuTri}
                                        </Text>

                                        {/* Chuẩn bị (nếu có) */}
                                        {event.chuanBi && (
                                            <Text className={`${event.trangThai === 'huy' ? 'text-red-500 line-through' : 'text-blue-600'} mb-2`}>
                                                Chuẩn bị: {event.chuanBi}
                                            </Text>
                                        )}

                                        {/* Thành phần */}
                                        <Text className={`${event.trangThai === 'huy' ? 'text-red-500 line-through' : 'text-blue-600'} mb-2`}>
                                            Thành phần: {event.thanhPhan}
                                        </Text>

                                        {/* Mời (nếu có) */}
                                        {event.moi && (
                                            <Text className={`${event.trangThai === 'huy' ? 'text-red-500 line-through' : 'text-blue-600'} mb-2`}>
                                                Mời: {event.moi}
                                            </Text>
                                        )}

                                        {/* Ghi chú (nếu có) */}
                                        {event.ghiChu && (
                                            <Text className={`${event.trangThai === 'huy' ? 'text-red-500 line-through' : 'text-blue-600'} mb-2`}>
                                                Ghi chú: {event.ghiChu}
                                            </Text>
                                        )}

                                        {/* File đính kèm */}
                                        {event.fileDinhKem && (
                                            <View className="mt-4">
                                                <Text className="text-blue-800 font-semibold">File đính kèm</Text>
                                                {parseFileAttachments(event.fileDinhKem).map((fileName, index) => (
                                                    <Pressable
                                                        key={index}
                                                        onPress={() => handleDownload(publicfolder + "/documents/" + fileName)}
                                                        className="py-2 px-4 mt-2 rounded-md bg-blue-500 hover:bg-blue-600"
                                                    >
                                                        <Text className="flex items-center text-white">
                                                            <FontAwesomeIcon color='white' icon={faDownload} className="mr-2" /> {fileName}
                                                        </Text>
                                                    </Pressable>
                                                ))}
                                            </View>
                                        )}

                                        <View className="absolute top-0 right-0 p-1 rounded-lg flex flex-row gap-2">
                                            <Pressable
                                                onPress={() => handleCopyText(event)}
                                                className="p-2 bg-blue-500 rounded-lg"
                                            >
                                                <FontAwesomeIcon color='white' icon={faClipboard} size={20} />
                                            </Pressable>
                                            <Pressable
                                                onPress={() => { setModalVisible(true); setSelectedEvent(event); }}
                                                className="p-2 bg-blue-500 rounded-lg">
                                                <FontAwesomeIcon color='white' icon={faClockFour} size={20} />
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}

                            </ScrollView>
                        </View>
                    )}
                </PanGestureHandler>
                <ReminderModal
                    visible={modalVisible}
                    onClose={handleModalClose}
                    onSelectReminder={handleReminderSelect}
                    event={selectedEvent}
                />
            </View>
        </GestureHandlerRootView>
    );
};

export default LichHopScreen;
