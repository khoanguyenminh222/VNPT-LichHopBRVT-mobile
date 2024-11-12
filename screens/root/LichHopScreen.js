import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';

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

// Dữ liệu sự kiện mẫu
const events = [
    {
        ngayBatDau: '2024-11-12',
        gioBatDau: '08:30',
        ngayKetThuc: '2024-11-15',
        gioKetThuc: '10:00',
        noiDungCuocHop: 'Cuộc họp chiến lược',
        chuTri: 'Ông A',
        chuanBi: 'Phòng Kinh doanh',
        thanhPhan: 'Ban Giám đốc, Phòng Kinh doanh',
        moi: 'Giám đốc',
        diaDiem: 'Phòng họp VTT',
        ghiChu: 'Mang theo tài liệu dự án',
        fileDinhKem: 'tai-lieu-hop.pdf',
    },
    {
        ngayBatDau: '2024-11-13',
        gioBatDau: '14:00',
        ngayKetThuc: '2024-11-15',
        gioKetThuc: '16:00',
        noiDungCuocHop: 'Chuyển giao công việc',
        chuTri: 'Ông B',
        chuanBi: 'Phòng Nhân sự',
        thanhPhan: 'Phòng Nhân sự, Phòng IT',
        moi: 'Nhân viên Phòng IT',
        diaDiem: 'Phòng họp VTT',
        ghiChu: 'Chuẩn bị tài liệu liên quan',
        fileDinhKem: 'chuyen-giao.pdf',
    },
    {
        ngayBatDau: '2024-11-15',
        gioBatDau: '09:00',
        ngayKetThuc: '2024-11-15',
        gioKetThuc: '12:00',
        noiDungCuocHop: 'Sinh nhật công ty',
        chuTri: 'Ban tổ chức',
        chuanBi: 'Phòng Hành chính',
        thanhPhan: 'Toàn bộ nhân viên',
        moi: 'Toàn bộ nhân viên',
        diaDiem: 'Hội trường VTT',
        ghiChu: 'Ăn mặc trang trọng',
        fileDinhKem: '',
    },
    {
        ngayBatDau: '2024-11-15',
        gioBatDau: '11:00',
        ngayKetThuc: '2024-11-15',
        gioKetThuc: '12:00',
        noiDungCuocHop: 'Sinh nhật công ty',
        chuTri: 'Ban tổ chức',
        chuanBi: 'Phòng Hành chính',
        thanhPhan: 'Toàn bộ nhân viên',
        moi: 'Toàn bộ nhân viên',
        diaDiem: 'Hội trường VTT',
        ghiChu: 'Ăn mặc trang trọng',
        fileDinhKem: '',
    }
];


const CalendarPage = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentWeekIndex, setCurrentWeekIndex] = useState(1);

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
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Hiển thị danh sách sự kiện trong ngày */}
                        {sortedEvents.map((event, index) => (
                            <View key={index} className="bg-blue-100 p-4 mb-4 rounded-xl shadow-lg">
                            <Text className="font-bold text-lg text-blue-900">{event.noiDungCuocHop}</Text>
                            <Text className="text-blue-700">{event.diaDiem}</Text>
                            <Text className="text-blue-500">{`Thời gian: ${event.gioBatDau} - ${event.gioKetThuc}`}</Text>
                            <Text className="text-blue-600">{`Chủ trì: ${event.chuTri}`}</Text>
                            <Text className="text-blue-600">{`Chuẩn bị: ${event.chuanBi}`}</Text>
                            <Text className="text-blue-600">{`Thành phần: ${event.thanhPhan}`}</Text>
                            <Text className="text-blue-600">{event.ghiChu}</Text>
                            {/* Hiển thị nút tải nếu có file đính kèm */}
                            {event.fileDinhKem && (
                                <Pressable 
                                    onPress={() => handleDownload(`/path/to/files/${event.fileDinhKem}`)}
                                    className="mt-4 py-3 px-6 bg-blue-500 rounded-md"
                                >
                                    <Text style={{ color: '#fff', fontSize: 16 }}>Tải file đính kèm</Text>
                                </Pressable>
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
