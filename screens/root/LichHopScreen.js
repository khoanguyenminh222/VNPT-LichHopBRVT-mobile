import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking, RefreshControl } from 'react-native';
import axiosInstance from '../../utils/axiosInstance';
import { eventRoute, publicfolder } from '../../api/baseURL';
import Toast from 'react-native-toast-message';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';

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

const CalendarPage = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentWeekIndex, setCurrentWeekIndex] = useState(1);
    const [events, setEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

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
        }
    }
    useEffect(() => {
        fetchEvents();
    }, []);

    const weekDates = getWeekDates(currentWeek);

    const getEventsForDate = (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        return events.filter((event) => {
            const eventDays = getEventDays(event.ngayBatDau, event.ngayKetThuc);
            return eventDays.some(eventDay => eventDay.toISOString().split('T')[0] === formattedDate);
        });
    };

    const handleNextWeek = () => {
        if (currentWeekIndex < 2) {
            const nextWeek = new Date(currentWeek);
            nextWeek.setDate(nextWeek.getDate() + 7);
            setCurrentWeek(nextWeek);
            setCurrentWeekIndex(2);

            // Kiểm tra ngày hiện tại có nằm trong tuần mới không
            const today = new Date();
            const nextWeekDates = getWeekDates(nextWeek);

            const focusDate = nextWeekDates.find(date => date.toDateString() === today.toDateString())
                ? today
                : nextWeekDates[0]; // Nếu không, focus vào thứ 2 của tuần mới

            setSelectedDate(focusDate);
        }
    };

    const handlePreviousWeek = () => {
        if (currentWeekIndex > 1) {
            const previousWeek = new Date(currentWeek);
            previousWeek.setDate(previousWeek.getDate() - 7);
            setCurrentWeek(previousWeek);
            setCurrentWeekIndex(1);

            // Kiểm tra ngày hiện tại có nằm trong tuần trước đó không
            const today = new Date();
            const previousWeekDates = getWeekDates(previousWeek);

            const focusDate = previousWeekDates.find(date => date.toDateString() === today.toDateString())
                ? today
                : previousWeekDates[0]; // Nếu không, focus vào thứ 2 của tuần mới

            setSelectedDate(focusDate);
        }
    };

    const handleSelectDate = (date) => {
        setSelectedDate(date);
    };

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
    const sortedEvents = sortEventsByStartTime(getEventsForDate(selectedDate));

    return (
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
            {selectedDate && (
                <View className="flex-1 p-4">
                    <ScrollView showsVerticalScrollIndicator={false} refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                fetchEvents();
                            }}
                        />
                    }>
                        {/* Hiển thị danh sách sự kiện trong ngày */}
                        {sortedEvents.map((event, index) => (
                            <View key={index} className="bg-blue-100 p-6 mb-6 rounded-xl shadow-lg border border-blue-300">
                                {/* Tên sự kiện */}
                                <Text className="font-bold text-2xl text-blue-900 mb-2">{event.noiDungCuocHop}</Text>

                                {/* Địa điểm */}
                                <Text className="text-blue-700 text-xl mb-2 font-extrabold">{event.diaDiem}</Text>

                                {/* Thời gian */}
                                <Text className="text-blue-500 mb-2">Thời gian: <Text className="font-semibold text-xl">{event.gioBatDau} - {event.gioKetThuc}</Text></Text>

                                {/* Chủ trì */}
                                <Text className="text-blue-600 mb-2">Chủ trì: {event.chuTri}</Text>

                                {/* Chuẩn bị (nếu có) */}
                                {event.chuanBi && <Text className="text-blue-600 mb-2">Chuẩn bị: {event.chuanBi}</Text>}

                                {/* Thành phần */}
                                <Text className="text-blue-600 mb-2">Thành phần: {event.thanhPhan}</Text>

                                {/* Mời (nếu có) */}
                                {event.moi && <Text className="text-blue-600 mb-2">Mời: {event.moi}</Text>}

                                {/* Ghi chú (nếu có) */}
                                {event.ghiChu && <Text className="text-blue-600 mb-2">Ghi chú: {event.ghiChu}</Text>}

                                {/* File đính kèm */}
                                {event.fileDinhKem && (
                                    <View className="mt-4">
                                        <Text className="text-blue-800 font-semibold">File đính kèm</Text>
                                        {JSON.parse(event.fileDinhKem).map((fileName, index) => (
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
                            </View>

                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default CalendarPage;
