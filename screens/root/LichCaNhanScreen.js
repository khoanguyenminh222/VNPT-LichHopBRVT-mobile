import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Linking, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import axiosInstance from '../../utils/axiosInstance';
import { lichCaNhanRoute, publicfolder } from '../../api/baseURL';
import Toast from 'react-native-toast-message';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';
import { PanGestureHandler, State, ScrollView, RefreshControl } from 'react-native-gesture-handler';
import { faAdd, faClipboard, faClockFour, faEdit } from '@fortawesome/free-solid-svg-icons';
import ReminderModal from '../../components/ReminderModal';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LichCaNhanModal from '../../components/LichCaNhanModal';
import { useAuth } from '../../context/AuthContext';
import { useFontSize } from '../../context/FontSizeContext';
import { useHighlightText } from '../../context/HighlightTextContext';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const LichCaNhanScreen = () => {
    const { highlightText } = useHighlightText();
    const { fontSize } = useFontSize();
    const { user } = useAuth();
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentWeekIndex, setCurrentWeekIndex] = useState(1);
    const [events, setEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modelEdit, setModelEdit] = useState(false);
    const scrollViewRef = useRef(null);

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
    
    const weekDates = getWeekDates(currentWeek);

    // Khi selectedDate thay đổi, cuộn đến ngày được chọn
    useEffect(() => {
        if (scrollViewRef.current && selectedDate) {
            // Tìm index của ngày được chọn
            const selectedIndex = weekDates.findIndex(date => date.getDate() === selectedDate.getDate());

            // Cuộn đến ngày được chọn (ví dụ: mỗi ngày cách nhau 50px)
            if (selectedIndex !== -1) {
                scrollViewRef.current.scrollTo({ x: selectedIndex * 50, animated: true });
            }
        }
    }, [selectedDate, weekDates]); // Khi `selectedDate` thay đổi, thực hiện cuộn lại

    // Hàm hỗ trợ để highlight text
    const applyHighlight = (text) => {
        if (!highlightText) return text;
        const regex = new RegExp(`(${highlightText})`, 'gi'); // Tìm kiếm tất cả các từ giống với highlightText
        const parts = text.split(regex); // Tách text thành các phần dựa trên highlightText
        return parts.map((part, index) =>
            part.toLowerCase() === highlightText.toLowerCase() ? (
                <Text key={index} style={{ backgroundColor: 'yellow' }}>
                    {part}
                </Text>
            ) : (
                part
            )
        );
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
            const response = await axiosInstance.get(lichCaNhanRoute.findByAccountId + "/" + user?.id);
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
                body: `Cuộc họp "${event.chuDe}" sẽ diễn ra trong ${minutes} phút.`,
                sound: true,
            },
            trigger: { date: reminderTime },
        });

        Toast.show({
            type: 'success',
            text1: 'Đã đặt nhắc nhở',
            text2: `Nhắc nhở sự kiện "${event.chuDe}" sẽ được gửi trước ${minutes} phút.`,
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

    // Sự kiện Huỷ event
    const handleCancleEvent = async () => {
        fetchEvents();
    };

    // Sự kiện Duyệt event
    const handleAcceptEvent = async () => {
        fetchEvents();
    };

    // Lưu sự kiện
    const handleSaveEdit = async () => {
        fetchEvents();
    };

    // Xóa sự kiện
    const handleDeleteEvent = async () => {
        fetchEvents();
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
                <View className="flex-row justify-between items-center mb-6 w-full max-w-[460px] m-auto rounded-lg px-2">
                    {/* Nút trước */}
                    <Pressable
                        onPress={handlePreviousWeek}
                        className={`p-4 rounded-lg ${currentWeekIndex <= 1 ? "opacity-50 pointer-events-none" : "bg-blue-100 hover:bg-blue-200"}`}
                    >
                        <Text className="text-2xl text-blue-600 font-semibold">{"<"}</Text>
                    </Pressable>

                    {/* Danh sách ngày */}
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
                        className="flex-1 mx-1 space-x-4"
                    >
                        {weekDates.map((item, index) => {
                            const isSelected = selectedDate && selectedDate.getDate() === item.getDate();
                            return (
                                <Pressable
                                    key={index}
                                    onPress={() => handleSelectDate(item)}
                                    className={`w-16 flex items-center p-3 rounded-lg transition-all duration-200 border ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-black'}`}
                                >
                                    <Text className={`text-sm uppercase tracking-wide ${isSelected ? 'text-white font-medium' : 'text-gray-500'}`}>
                                        {item.toLocaleDateString('vi-VN', { weekday: 'short' })}
                                    </Text>
                                    <Text className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                        {item.getDate()}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    {/* Nút sau */}
                    <Pressable
                        onPress={handleNextWeek}
                        className={`p-4 rounded-lg ${currentWeekIndex >= 2 ? "opacity-50 pointer-events-none" : "bg-blue-100 hover:bg-blue-200"}`}
                    >
                        <Text className="text-2xl text-blue-600 font-semibold">{">"}</Text>
                    </Pressable>
                </View>
                {/* Hiển thị thứ, ngày  */}
                <Text style={{ fontSize: Number(fontSize) + 6 }} className="text-2xl text-center text-blue-800 mb-4">{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                <PanGestureHandler
                    onGestureEvent={handleGestureEvent}
                    onHandlerStateChange={handleHandlerStateChange}
                >
                    <View className="flex-1">
                        {selectedDate && (
                            <View className="flex-1 p-4 w-full max-w-[460px] m-auto">
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
                                        <View key={index} className={`${event.trangThai === 'huy' ? 'bg-gray-100 border-gray-300' : event.trangThai == 'dangKy' ? 'bg-purple-100 border-purple-300' : event.quanTrong === 1 ? 'bg-red-100 border-red-300' : 'bg-blue-100 border-blue-300'} p-6 mb-6 rounded-xl shadow-lg border relative`}>
                                            {/* Loại sự kiện */}
                                            <Text style={{ fontSize: Number(fontSize) + 4 }} className={`${event.trangThai === 'huy' ? 'text-gray-800 line-through' : event.trangThai == 'dangKy' ? 'text-purple-800' : event.quanTrong == 1 ? 'text-red-800' : 'text-blue-800'} font-bold text-xl mb-2 mt-4`}>
                                                Loại sự kiện: {applyHighlight(event.loaiSuKien)}
                                            </Text>

                                            {/* Chủ đề */}
                                            <Text style={{ fontSize: Number(fontSize) + 6 }} className={`${event.trangThai === 'huy' ? 'text-gray-900 line-through' : event.trangThai == 'dangKy' ? 'text-purple-900' : event.quanTrong == 1 ? 'text-red-900' : 'text-blue-900'} font-bold text-2xl mb-2`}>
                                                Chủ đề: {applyHighlight(event.chuDe)}
                                            </Text>

                                            {/* Địa điểm */}
                                            <Text style={{ fontSize: Number(fontSize) + 4 }} className={`${event.trangThai === 'huy' ? 'text-gray-500 line-through' : event.trangThai == 'dangKy' ? 'text-purple-500' : event.quanTrong == 1 ? 'text-red-500' : 'text-blue-500'} font-bold text-xl mb-2`}>
                                                {applyHighlight(event.diaDiem)}
                                            </Text>

                                            {/* Thời gian */}
                                            <Text style={{ fontSize: Number(fontSize) }} className={`${event.trangThai === 'huy' ? 'text-gray-500 line-through' : event.trangThai == 'dangKy' ? 'text-purple-500' : event.quanTrong == 1 ? 'text-red-500' : 'text-blue-500'} font-bold mb-2`}>
                                                Thời gian: <Text style={{ fontSize: Number(fontSize) + 4 }} className="font-semibold text-xl">{applyHighlight(event.gioBatDau)} - {applyHighlight(event.gioKetThuc)}</Text>
                                            </Text>

                                            {/* Nội dung */}
                                            <Text style={{ fontSize: Number(fontSize) }} className={`${event.trangThai === 'huy' ? 'text-gray-600 line-through' : event.trangThai == 'dangKy' ? 'text-purple-600' : event.quanTrong == 1 ? 'text-red-600' : 'text-blue-600'} font-bold mb-2`}>
                                                Nội dung: {applyHighlight(event.noiDung)}
                                            </Text>

                                            {/* File đính kèm */}
                                            {event.fileDinhKem && (
                                                <View className="mt-4">
                                                    <Text style={{ fontSize: Number(fontSize) }} className={`${event.trangThai === 'huy' ? 'text-gray-800' : event.trangThai == 'dangKy' ? 'text-purple-800' : event.quanTrong === 1 ? 'text-red-800' : 'text-blue-800'} font-semibold`}>File đính kèm</Text>
                                                    {parseFileAttachments(event.fileDinhKem).map((fileName, index) => (
                                                        <Pressable
                                                            key={index}
                                                            onPress={() => handleDownload(publicfolder + "/documents/" + fileName)}
                                                            className={`py-2 px-4 mt-2 rounded-md ${event.trangThai === 'huy' ? 'bg-gray-500 hover:bg-gray-600' : event.trangThai == 'dangKy' ? 'bg-purple-500 hover:bg-purple-600' : event.quanTrong === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                                                        >
                                                            <Text style={{ fontSize: Number(fontSize) }} className="flex items-center text-white">
                                                                <FontAwesomeIcon color='white' icon={faDownload} className="mr-2" size={Number(fontSize) - 2} /> {applyHighlight(fileName)}
                                                            </Text>
                                                        </Pressable>
                                                    ))}
                                                </View>
                                            )}

                                            <View className="absolute top-0 right-0 p-1 rounded-lg flex flex-row gap-2">
                                                <Pressable
                                                    onPress={() => handleCopyText(event)}
                                                    className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}
                                                >
                                                    <FontAwesomeIcon color='white' icon={faClipboard} size={Number(fontSize) + 4} />
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => { setModalVisible(true); setSelectedEvent(event); }}
                                                    className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}>
                                                    <FontAwesomeIcon color='white' icon={faClockFour} size={Number(fontSize) + 4} />
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => { setModelEdit(true); setSelectedEvent(event); }}
                                                    className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}>
                                                    <FontAwesomeIcon color='white' icon={faEdit} size={Number(fontSize) + 4} />
                                                </Pressable>
                                            </View>
                                        </View>
                                    ))}

                                </ScrollView>
                            </View>
                        )}
                        {/* Button thêm mới */}
                        <Pressable
                            onPress={() => { setModelEdit(true); setSelectedEvent(null); }}
                            className="absolute right-4 bottom-4 p-6 bg-blue-500 rounded-full shadow-lg"
                        >
                            <Text><FontAwesomeIcon icon={faAdd} color='white' size={Number(fontSize) - 2} /></Text>
                        </Pressable>
                    </View>
                </PanGestureHandler>
                <ReminderModal
                    visible={modalVisible}
                    onClose={handleModalClose}
                    onSelectReminder={handleReminderSelect}
                    event={selectedEvent}
                />
                <LichCaNhanModal
                    visible={modelEdit}
                    selectedEvent={selectedEvent}
                    onClose={() => { setModelEdit(false); setSelectedEvent(null) }}
                    onCancle={handleCancleEvent}
                    onSave={handleSaveEdit}
                    onDelete={handleDeleteEvent}
                    onAccept={handleAcceptEvent}
                    user={user}
                />
            </View>
        </GestureHandlerRootView>
    );
};

export default LichCaNhanScreen;
