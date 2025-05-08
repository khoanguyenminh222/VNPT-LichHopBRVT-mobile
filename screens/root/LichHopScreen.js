import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Linking, Alert, PanResponder, Animated, ScrollView, RefreshControl, FlatList, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import axiosInstance from '../../utils/axiosInstance';
import { accountDuyetLichRoute, accountRoute, eventRoute, lichCaNhanRoute, publicfolder, sendSMSRoute, thongBaoNhacNhoRoute } from '../../api/baseURL';
import Toast from 'react-native-toast-message';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';

import { faAdd, faArrowLeftLong, faArrowRightLong, faClipboard, faClock, faClockFour, faEdit, faShuffle, faTrash } from '@fortawesome/free-solid-svg-icons';
import ReminderModal from '../../components/ReminderModal';
import * as Notifications from 'expo-notifications';

import LichHopModal from '../../components/LichHopModal';
import { useAuth } from '../../context/AuthContext';
import hasAccess from '../../utils/permissionsAllowedURL';
import { screenUrls } from '../../api/routes';
import { useFontSize } from '../../context/FontSizeContext';
import { useHighlightText } from '../../context/HighlightTextContext';
import DialogComponent from '../../components/Dialog';
import { useViewModeStore } from '../../stores/StoreViewMode';
import { Divider } from 'react-native-paper';
import { formatDate, getStartAndEndOfWeek } from '../../utils/dateTimeUtils';
import sendSms from '../../utils/sendSms';
import removeAccents from "remove-accents";
import { getWeek, parse } from "date-fns";
import DetailLichHopModal from '../../components/DetailLichHopModal';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const getWeekNumber = (date) => {
    const today = date; // Lấy ngày hiện tại
    const weekNumber = getWeek(today, { weekStartsOn: 1 }); // Tuần bắt đầu từ Thứ Hai
    const formattedWeek = String(weekNumber).padStart(2, "0"); // Định dạng thành 2 chữ số
    return formattedWeek + "/" + new Date().getFullYear();
}

export const formatDateForSMS = (date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    const s = date.getSeconds().toString().padStart(2, "0");
    return `${h}:${min}:${s} ${d}/${m}/${y}`;
};

export const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const fetchThongBaoNhacNho = async (eventId, userId) => {
    try {
        const response = await axiosInstance.get(thongBaoNhacNhoRoute.findByEventIdAndAccountId, {
            params: {
                eventId: eventId, // Truyền eventId vào API
                accountId: userId, // Truyền accountId vào API
            },
        });
        return response.data; // Trả về dữ liệu nhắc nhở
    } catch (error) {
        console.error('Error fetching thongBaoNhacNho:', error);
        return null; // Trả về null nếu có lỗi
    }
};

const LichHopScreen = () => {
    const { highlightText } = useHighlightText();
    const { freshing, setFreshing } = useState(false);
    const { fontSize } = useFontSize();
    const { user, userAllowedUrls } = useAuth();
    const [isCurrentWeek, setIsCurrentWeek] = useState(true);
    const now = new Date();
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
    const [visibleDialog, setVisibleDialog] = useState(false);
    const viewMode = useViewModeStore(state => state.viewMode);
    const [nhacNhoData, setNhacNhoData] = useState({});

    const handleFetchNhacNho = async (event) => {
        try {
            const data = await fetchThongBaoNhacNho(event.id, user.id); // Fetch dữ liệu
            return { eventId: event.id, data: data.eventId || null }; // Đảm bảo trả về đối tượng đúng cấu trúc
        } catch (error) {
            console.error('Lỗi khi fetch nhắc nhở:', error);
            return { eventId: event.id, data: null }; // Trả về null nếu có lỗi
        }
    };

    // Dùng useEffect để gọi handleFetchNhacNho cho mỗi event khi events thay đổi
    useEffect(() => {
        const fetchData = async () => {
            //setIsLoading(true); // Bắt đầu trạng thái loading
            try {
                // Gọi tất cả API cùng lúc bằng Promise.all
                const results = await Promise.all(events.map(event => handleFetchNhacNho(event)));

                // Cập nhật dữ liệu nhắc nhở cho từng event
                const newData = results.reduce((acc, result) => {
                    if (result && result.eventId) { // Kiểm tra xem có eventId không
                        acc[result.eventId] = result.data; // Cập nhật data cho eventId
                    }
                    return acc;
                }, {});
                //console.log(newData)

                setNhacNhoData(newData); // Cập nhật state
            } catch (error) {
                console.error('Lỗi khi fetch dữ liệu:', error);
            } finally {
                //setIsLoading(false); // Xong thì set lại trạng thái loading
            }
        };

        fetchData(); // Gọi fetchData khi events thay đổi
    }, [events]);

    const showDialog = () => {
        setVisibleDialog(true);
    };

    const handleCancel = () => {
        setVisibleDialog(false);
    };

    // handle refresh flat list
    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents().then(() => setRefreshing(false));
    }
    const [eventNotifications, setEventNotifications] = useState({}); // State lưu id thông báo của sự kiện

    const [isAccountDuyetLich, setIsAccountDuyetLich] = useState(false);
    useEffect(() => {
        const checkAccountDuyetLich = async () => {
            try {
                const response = await axiosInstance.get(accountDuyetLichRoute.findAll);

                // Lấy ngày hiện tại (chỉ lấy phần ngày)
                const currentDate = new Date();
                const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                // Kiểm tra user có username trong danh sách và ngày nằm giữa ngayBatDau và ngayKetThuc
                const isAccountDuyetLich = response.data.some(account => {
                    if (account.username === user?.username) {
                        const ngayBatDau = new Date(account.ngayBatDau);
                        const ngayKetThuc = new Date(account.ngayKetThuc);

                        // Chỉ lấy phần ngày của ngayBatDau và ngayKetThuc
                        const ngayBatDauOnly = new Date(ngayBatDau.getFullYear(), ngayBatDau.getMonth(), ngayBatDau.getDate());
                        const ngayKetThucOnly = new Date(ngayKetThuc.getFullYear(), ngayKetThuc.getMonth(), ngayKetThuc.getDate());

                        return currentDateOnly >= ngayBatDauOnly && currentDateOnly <= ngayKetThucOnly;
                    }
                    return false;
                });
                setIsAccountDuyetLich(isAccountDuyetLich);
            }
            catch (error) {
                console.log('Failed to fetch account duyet lich:', error);
                const errorMessage = error.response ? error.response.data.message : error.message;
                Toast.show({
                    type: 'error',
                    text1: errorMessage,
                    position: 'top',
                    visibilityTime: 3000,
                });
            }
        }
        checkAccountDuyetLich();
    }, []);

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
        const regex = new RegExp(`(${highlightText})`, 'gi');
        const parts = text.split(regex);
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
            let response;
            if (hasAccess(screenUrls.DuyetLichHop, userAllowedUrls) || isAccountDuyetLich || user.vaiTro === "admin") {
                response = await axiosInstance.get(eventRoute.findAll);
            } else {
                response = await axiosInstance.get(eventRoute.findAll, {
                    params: {
                        accountId: user.id,
                    },
                });
            }
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
    }, [isAccountDuyetLich, selectedDate]);

    const handleCloseModal = () => {
        setModelEdit(false);
        setSelectedEvent({
            noiDungCuocHop: "",
            chuTri: "",
            chuanBi: "",
            thanhPhan: "",
            ghiChuThanhPhan: "",
            moi: "",
            diaDiem: "",
            ghiChu: "",
            ngayBatDau: new Date().toISOString().split('T')[0],
            gioBatDau: "08:00",
            ngayKetThuc: new Date().toISOString().split('T')[0],
            gioKetThuc: null,
            fileDinhKem: "",
            trangThai: "",
            accountId: user?.id,
            quanTrong: 0,
        });
    }
    const handleDeleteEvent = async () => {
        try {
            const response = await axiosInstance.delete(eventRoute.delete + "/" + selectedEvent.id);
            if (response.status >= 200 && response.status < 300) {
                Toast.show({
                    type: 'success',
                    text1: response.data.message,
                });
                handleCloseModal();
                setVisibleDialog(false);
                if (selectedEvent.accountId != user.id) {
                    console.log("gửi sms");
                    const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + selectedEvent.accountId);
                    await axiosInstance.post(sendSMSRoute.sendSMS, {
                        phonenumber: responseAccount.data.phone,
                        content: 'Lich hop BRVT: [Trang thai: Xoa] ' + removeDiacritics(selectedEvent.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${selectedEvent.ngayBatDau}T${selectedEvent.gioBatDau}:00`))
                    });
                }
                fetchEvents();
            } else {
                Toast.show({
                    type: 'error',
                    text1: response.data.message,
                });
            }
        } catch (error) {
            console.log(error);
            const errorMessage = error.response ? error.response.data.message : error.message;
            Toast.show({
                type: 'error',
                text1: errorMessage,
            });
        }
    };

    // Hàm lấy ra các sự kiện cho ngày đã chọn
    const getEventsForDate = (date) => {
        const formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        //console.log(formattedDate)
        return events.filter((event) => {
            // Kiểm tra nếu có sự kiện với ngày bắt đầu và kết thúc hợp lệ
            if (!event.ngayBatDau || !event.ngayKetThuc) return false;

            const eventDays = getEventDays(event.ngayBatDau, event.ngayKetThuc);
            return eventDays.some(eventDay => eventDay.getFullYear() + '-' + String(eventDay.getMonth() + 1).padStart(2, '0') + '-' + String(eventDay.getDate()).padStart(2, '0') === formattedDate);
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
            setIsCurrentWeek(false);
            setSelectedDate(focusDate);
            setWeekRange({ start: getStartAndEndOfWeek(7).start, end: getStartAndEndOfWeek(7).end });
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
            setIsCurrentWeek(true)
            setWeekRange({ start: getStartAndEndOfWeek(0).start, end: getStartAndEndOfWeek(0).end });
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
    const translateX = useRef(new Animated.Value(0)).current;
    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event(
            [null, { dx: translateX }],
            { useNativeDriver: false }
        ),
        onPanResponderRelease: (evt, gestureState) => {
            if (gestureState.dx < -50) {
                handleNextDay(); // Vuốt sang phải
            } else if (gestureState.dx > 50) {
                handlePreviousDay(); // Vuốt sang trái
            }
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: false,
            }).start();
        },
    });

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
            Thời gian: ${event.gioBatDau} ${event.gioKetThuc ? '- ' + event.gioKetThuc : ''}
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
        // Kiểm tra event đã qua hay chưa
        const eventDateTime = new Date(`${event.ngayBatDau}T${event.gioBatDau}`);
        if (eventDateTime < new Date()) {
            Alert.alert('Không thể đặt nhắc nhở', 'Sự kiện đã qua, không thể đặt nhắc nhở cho sự kiện đã qua.');
            return;
        }
        // Kiểm tra quyền
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission not granted for notifications');
            return;
        }

        const reminderTime = new Date(eventDateTime.getTime() - minutes * 60 * 1000);
        if (reminderTime < new Date()) {
            Alert.alert('Không thể đặt nhắc nhở', 'Thời gian nhắc nhở đã qua, không thể đặt nhắc nhở cho sự kiện đã qua.');
            return;
        }

        try {
            const response = await axiosInstance.put(`${eventRoute.update}/${event.id}`, { nhacNho: minutes });
            if (response.status < 200 || response.status >= 300) {
                throw new Error("Error updating reminder");
            }
            fetchEvents();
        } catch (error) {
            console.error("Error updating reminder:", error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Có lỗi xảy ra khi lưu nhắc nhở'
            });
            return;
        }

        // Nếu đã có thông báo cho sự kiện này, xóa thông báo cũ
        if (eventNotifications[event.id]) {
            await Notifications.cancelScheduledNotificationAsync(eventNotifications[event.id]);
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Nhắc nhở họp",
                body: `Cuộc họp "${event.noiDungCuocHop}" sẽ diễn ra lúc ${event.ngayBatDau} ${event.gioBatDau}.`,
                sound: true,
            },
            trigger: { date: reminderTime },
        });

        // Lưu notificationId mới nhất vào state
        setEventNotifications((prev) => ({
            ...prev,
            [event.id]: notificationId,
        }));

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Đã đặt nhắc nhở",
                body: `Nhắc nhở sự kiện "${event.noiDungCuocHop}" sẽ được gửi trước ${minutes} phút.`,
                sound: true,
            },
            trigger: null,
        });

        Toast.show({
            type: 'success',
            text1: 'Đã đặt nhắc nhở',
            text2: `Nhắc nhở sự kiện "${event.noiDungCuocHop}" sẽ được gửi trước ${minutes} phút.`,
            position: 'top',
            visibilityTime: 3000,
        });
        handleModalClose();
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
        setSelectedEvent({
            noiDungCuocHop: "",
            chuTri: "",
            chuanBi: "",
            thanhPhan: "",
            ghiChuThanhPhan: "",
            moi: "",
            diaDiem: "",
            ghiChu: "",
            ngayBatDau: new Date().toISOString().split('T')[0],
            gioBatDau: "08:00",
            ngayKetThuc: new Date().toISOString().split('T')[0],
            gioKetThuc: null,
            fileDinhKem: "",
            trangThai: "",
            accountId: user?.id,
            quanTrong: 0,
        });
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





    // Gán lịch họp sang lịch cá nhân
    const handleToLichCaNhan = async (event) => {
        const lichCaNhan = {
            loaiSuKien: "Sự kiện công việc",
            chuDe: event.noiDungCuocHop,
            diaDiem: event.diaDiem,
            noiDung: event.ghiChu,
            ngayBatDau: event.ngayBatDau,
            gioBatDau: event.gioBatDau,
            ngayKetThuc: event.ngayKetThuc,
            gioKetThuc: event.gioKetThuc ? event.gioKetThuc : null,
            accountId: user?.id,
            fileDinhKem: event.fileDinhKem,
            trangThai: event.trangThai,
            quanTrong: event.quanTrong,
        };
        try {
            const response = await axiosInstance.post(lichCaNhanRoute.create, lichCaNhan);
            if (response.status >= 200 && response.status < 300) {
                Toast.show({
                    type: 'success',
                    text1: 'Gán lịch họp',
                    text2: 'Đã gán lịch họp sang lịch cá nhân!',
                    position: 'top',
                    visibilityTime: 3000,
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Gán lịch họp',
                    text2: 'Đã xảy ra lỗi khi gán lịch họp!',
                    position: 'top',
                    visibilityTime: 3000,
                });
            }
        } catch (error) {
            console.log('Failed to assign event to personal calendar:', error);
            const errorMessage = error.response ? error.response.data.message : error.message;
            Toast.show({
                type: 'error',
                text1: 'Gán lịch họp',
                text2: errorMessage,
                position: 'top',
                visibilityTime: 3000,
            });
        }
    };
    const SortEventByDate = (date) => {
        if (!date) {
            return null;
        }
        const sortedEvents = sortEventsByStartTime(getEventsForDate(date));
        return sortedEvents;
    }
    const [weekRange, setWeekRange] = useState({
        start: getStartAndEndOfWeek(0).start,
        end: getStartAndEndOfWeek(0).end,
    });
    const [modalDetail, setModalDetail] = useState(false);
    const renderEvent = ({ item }) => {
        const events = SortEventByDate(item);
        const date = new Date().getDate();
        return (
            <View className="flex flex-row my-4">
                <View className="basis-1/5 items-center">
                    <Text className={`text-lg uppercase text-center ${date === item.getDate() ? 'text-blue-800 font-bold ' : 'text-black font-semibold '}`}>
                        {item.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </Text>
                    <Text className={` text-sm font-semibold text-center ${date === item.getDate() ? 'text-blue-800 font-bold ' : 'text-black font-semibold'}`}>
                        {(item.getDate() < 10 ? "0" + item.getDate() : item.getDate()) + "/" + ((item.getMonth() + 1) < 10 ? "0" + (item.getMonth() + 1) : (item.getMonth() + 1))}
                    </Text>
                </View>
                <View className="basis-4/5 pl-2 pr-5 w-full">
                    <Divider bold={false} style={{ marginBottom: 16, backgroundColor: "black" }} />
                    {events.length === 0 ? (
                        <Text className="text-center text-gray-500">Không có lịch họp</Text>
                    ) : (
                        events.map((event, index) => (
                            <View key={index} className="mb-4">
                                <View
                                    className={`flex-row items-center justify-between rounded-lg shadow-lg ${event.trangThai === 'huy' ? 'bg-gray-100 border-gray-500' : event.trangThai === 'dangKy' ? 'bg-purple-100 border-purple-500' : event.quanTrong === 1 ? 'bg-red-100 border-red-500' : 'bg-blue-100 border-blue-500'}`}
                                    onPress={() => { setModelEdit(true); setSelectedEvent(event); }}>
                                    <Pressable onPress={() => { setModalDetail(true); setSelectedEvent(event) }}>
                                        <View className="p-4">
                                            <Text style={{ fontSize: fontSize * 1.3 }} className={`font-semibold ${event.trangThai === 'huy' ? 'line-through' : ''}`}>{event?.noiDungCuocHop}</Text>
                                            <Text style={{ fontSize: fontSize * 1.1 }} className={`${event.trangThai === 'huy' ? 'line-through' : ''}`}>Địa điểm: {event.diaDiem != 'Khác' ? applyHighlight(event.diaDiem) : applyHighlight(event.ghiChu)}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <FontAwesomeIcon icon={faClock} size={fontSize} />
                                                <Text style={{ fontSize: fontSize * 1.1 }} className={`font-semibold pl-2 ${event.trangThai === 'huy' ? 'line-through' : ''}`}>{applyHighlight(event.gioBatDau)} {event.gioKetThuc != null && event.gioKetThuc != 'Inval' && '- ' + applyHighlight(event.gioKetThuc)}</Text>
                                            </View>
                                            <View className="rounded-lg flex flex-row gap-2">
                                                {/* Gán lịch họp sang lịch cá nhân */}
                                                <Pressable
                                                    onPress={() => handleToLichCaNhan(event)}
                                                    className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}
                                                >
                                                    <FontAwesomeIcon color='white' icon={faShuffle} size={fontSize} />
                                                </Pressable>
                                                {/* Copy lịch */}
                                                <Pressable
                                                    onPress={() => handleCopyText(event)}
                                                    className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}
                                                >
                                                    <FontAwesomeIcon color='white' icon={faClipboard} size={fontSize} />
                                                </Pressable>
                                                {/* Nhắc nhở */}
                                                <Pressable
                                                    onPress={() => { setModalVisible(true); setSelectedEvent(event); }}
                                                    className={`flex flex-row items-center p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}
                                                >
                                                    <FontAwesomeIcon color='white' icon={faClockFour} size={fontSize} />
                                                    {/* Gọi api */}


                                                    {/* {event.nhacNho && (
                                                    <Text style={{ fontSize: 10 }} className="text-white ml-2">Đã nhắc nhở</Text>
                                                )} */}
                                                    {nhacNhoData[event.id] && (
                                                        <Text style={{ fontSize: fontSize * 0.8 }} className="text-white ml-2">
                                                            {nhacNhoData[event.id] && 'Đã nhắc nhở'}
                                                        </Text>
                                                    )}
                                                </Pressable>
                                                {/* Chỉnh sửa */}
                                                {(hasAccess(screenUrls.ChinhSuaLichHop, userAllowedUrls) || user?.vaiTro == 'admin') && event.trangThai !== 'dangKy' &&
                                                    <Pressable
                                                        onPress={() => { setModelEdit(true); setSelectedEvent(event); }}
                                                        className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}>
                                                        <FontAwesomeIcon color='white' icon={faEdit} size={14} />
                                                    </Pressable>
                                                }
                                                {/* Có duyền duyệt hoặc là account được uỷ quyền */}
                                                {/* {(hasAccess(screenUrls.DuyetLichHop, userAllowedUrls) || isAccountDuyetLich || user?.vaiTro == 'admin') && event.trangThai === 'dangKy' && */}
                                                {event.trangThai === 'dangKy' &&
                                                    <Pressable
                                                        onPress={() => { setModelEdit(true); setSelectedEvent(event); }}
                                                        className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}>
                                                        <FontAwesomeIcon color='white' icon={faEdit} size={14} />
                                                    </Pressable>
                                                }

                                                {/* Xóa */}
                                                {(event && event.trangThai === "dangKy") && !(hasAccess(screenUrls.DuyetLichHop, userAllowedUrls) || isAccountDuyetLich) && (
                                                    <Pressable onPress={() => { setVisibleDialog(true); setSelectedEvent(event); }} className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai ==
                                                        'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}>
                                                        <FontAwesomeIcon color='white' icon={faTrash} size={14} />

                                                    </Pressable>
                                                )}


                                            </View>
                                        </View>
                                    </Pressable>
                                </View>

                            </View>
                        ))
                    )}

                </View>
            </View >
        );
    }
    const LichTheoTuan = ({ weekDates }) => {
        const today = new Date();
        const todayIndex = weekDates.findIndex(date => date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear());
        return (
            <View className="flex-1 bg-gray-50">
                <View className="m-5 flex flex-row justify-between items-center w-full">
                    {/* <Text style={{ fontSize: Number(fontSize) + 6 }} className="text-2xl text-center text-blue-800 font-semibold mb-4">Lịch họp tuần</Text> */}
                    <View>
                        <Text style={{ fontSize: Number(fontSize) + 4 }} className="text-2xl text-center text-blue-800 font-semibold ">
                            Lịch công tác tuần {getWeekNumber(weekRange.start)}
                        </Text>
                        <Text style={{ fontSize: Number(fontSize) + 4 }} className="text-2xl text-center text-blue-800 font-semibold ">
                            {formatDate(weekRange.start) + "-" + formatDate(weekRange.end)}
                        </Text>
                    </View>

                    <View className="flex-row gap-2 items-center mb-6 max-w-[460px] m-auto rounded-lg px-2">
                        {/* Nút đổi tuần hiện tại */}
                        <Pressable
                            onPress={handlePreviousWeek}
                            className={` rounded-full p-3 ${!isCurrentWeek ? 'bg-white border-gray-400' : 'bg-black'}`}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,
                            }}
                        >
                            <FontAwesomeIcon icon={faArrowLeftLong} size={fontSize} color={`${!isCurrentWeek ? 'black' : 'white'}`} />
                        </Pressable>

                        {/* Nút đổi tuần sau */}
                        <Pressable
                            onPress={handleNextWeek}
                            className={` rounded-full p-3 ${!isCurrentWeek ? ' bg-black ' : 'border-gray-400 bg-white'}`}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,
                            }}
                        >
                            <FontAwesomeIcon icon={faArrowRightLong} size={fontSize} color={`${!isCurrentWeek ? 'white' : 'black'}`} />
                        </Pressable>

                    </View>
                </View>
                <FlatList
                    data={weekDates}
                    renderItem={renderEvent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    keyExtractor={(item, index) => index.toString()}
                />
                <DialogComponent
                    open={visibleDialog}
                    title={'Xoá lịch họp'}
                    action={handleDeleteEvent}
                    onClose={handleCancel}
                    actionLabel={'Xoá'}
                />


            </View>
        )
    }


    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-blue-600 text-2xl">Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {viewMode === 2 ? (
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
                            className="flex-1 mx-4"
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
                    <Animated.View
                        {...panResponder.panHandlers}
                        style={[{ transform: [{ translateX }] }, { flex: 1 }]}
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
                                            <View key={index} className={`${event.trangThai === 'huy' ? 'bg-gray-100 border-gray-500' : event.trangThai === 'dangKy' ? 'bg-purple-100 border-purple-500' : event.quanTrong === 1 ? 'bg-red-100 border-red-500' : 'bg-blue-100 border-blue-500'} p-6 mb-6 rounded-xl shadow-lg border relative`}>
                                                {/* Tên sự kiện */}
                                                <Text style={{ fontSize: Number(fontSize) + 6 }} className={`${event.trangThai === 'huy' ? 'text-gray-900 line-through' : event.trangThai == 'dangKy' ? 'text-purple-900' : event.quanTrong == 1 ? 'text-red-900' : 'text-blue-900'} font-bold text-2xl mb-2 mt-4`}>
                                                    {applyHighlight(event.noiDungCuocHop)}
                                                </Text>

                                                {/* Địa điểm */}
                                                <Text style={{ fontSize: Number(fontSize) + 4 }} className={`${event.trangThai === 'huy' ? 'text-gray-700 line-through' : event.trangThai == 'dangKy' ? 'text-purple-700' : event.quanTrong == 1 ? 'text-red-700' : 'text-blue-700'} text-xl mb-2 font-extrabold`}>
                                                    {event.diaDiem != 'Khác' ? applyHighlight(event.diaDiem) : applyHighlight(event.ghiChu)}
                                                </Text>

                                                {/* Thời gian */}
                                                <Text style={{ fontSize: Number(fontSize) }} className={`${event.trangThai === 'huy' ? 'text-gray-500 line-through' : event.trangThai == 'dangKy' ? 'text-purple-500' : event.quanTrong == 1 ? 'text-red-500' : 'text-blue-500'} mb-2`}>
                                                    Thời gian: <Text style={{ fontSize: Number(fontSize) + 4 }} className="font-semibold text-xl">{applyHighlight(event.gioBatDau)} {event.gioKetThuc != null && event.gioKetThuc != 'Inval' && '- ' + applyHighlight(event.gioKetThuc)}</Text>
                                                </Text>

                                                {/* Chủ trì */}
                                                <Text style={{ fontSize: Number(fontSize) }} className={`${event.trangThai === 'huy' ? 'text-gray-600 line-through' : event.trangThai == 'dangKy' ? 'text-purple-600' : event.quanTrong == 1 ? 'text-red-600' : 'text-blue-600'} mb-2`}>
                                                    Chủ trì: {applyHighlight(event.chuTri)}
                                                </Text>

                                                {/* Chuẩn bị (nếu có) */}
                                                {event.chuanBi && (
                                                    <Text style={{ fontSize: Number(fontSize) }} className={`${event.trangThai === 'huy' ? 'text-gray-600 line-through' : event.trangThai == 'dangKy' ? 'text-purple-600' : event.quanTrong == 1 ? 'text-red-600' : 'text-blue-600'} mb-2`}>
                                                        Chuẩn bị: {applyHighlight(event.chuanBi)}
                                                    </Text>
                                                )}

                                                {/* Thành phần */}
                                                <Text style={{ fontSize: Number(fontSize) }} className={`${event.trangThai === 'huy' ? 'text-gray-600 line-through' : event.trangThai == 'dangKy' ? 'text-purple-600' : event.quanTrong == 1 ? 'text-red-600' : 'text-blue-600'} mb-2`}>
                                                    Thành phần:
                                                    {event.thanhPhan && applyHighlight(event.thanhPhan.split('\n').map(line => `\n- ${line}`).join('\n'))}
                                                    {event.ghiChuThanhPhan && applyHighlight(`\n${event.ghiChuThanhPhan}`)}
                                                </Text>

                                                {/* Mời (nếu có) */}
                                                {event.moi && (
                                                    <Text style={{ fontSize: Number(fontSize) }} className={`${event.trangThai === 'huy' ? 'text-gray-600 line-through' : event.trangThai == 'dangKy' ? 'text-purple-600' : event.quanTrong == 1 ? 'text-red-600' : 'text-blue-600'} mb-2`}>
                                                        Mời: {applyHighlight(event.moi)}
                                                    </Text>
                                                )}

                                                {/* Ghi chú (nếu có) */}
                                                {event.ghiChu && (
                                                    <Text style={{ fontSize: Number(fontSize) }} className={`${event.trangThai === 'huy' ? 'text-gray-600 line-through' : event.trangThai == 'dangKy' ? 'text-purple-600' : event.quanTrong === 1 ? 'text-red-600' : 'text-blue-600'} mb-2`}>
                                                        Ghi chú: {applyHighlight(event.ghiChu)}
                                                    </Text>
                                                )}

                                                {/* File đính kèm */}
                                                {event.fileDinhKem && event.trangThai !== 'huy' && (
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
                                                    {/* Gán lịch họp sang lịch cá nhân */}
                                                    <Pressable
                                                        onPress={() => handleToLichCaNhan(event)}
                                                        className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}
                                                    >
                                                        <FontAwesomeIcon color='white' icon={faShuffle} size={Number(fontSize) + 4} />
                                                    </Pressable>
                                                    {/* Copy lịch */}
                                                    <Pressable
                                                        onPress={() => handleCopyText(event)}
                                                        className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}
                                                    >
                                                        <FontAwesomeIcon color='white' icon={faClipboard} size={Number(fontSize) + 4} />
                                                    </Pressable>
                                                    {/* Nhắc nhở */}
                                                    <Pressable
                                                        onPress={() => { setModalVisible(true); setSelectedEvent(event); }}
                                                        className={`flex flex-row items-center p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}
                                                    >
                                                        <FontAwesomeIcon color='white' icon={faClockFour} size={Number(fontSize) + 4} />
                                                        {/* {event.nhacNho && (
                                                                <Text style={{ fontSize: Number(fontSize) }} className="text-white ml-2">Đã nhắc nhở</Text>
                                                            )} */}
                                                        {nhacNhoData[event.id] && (
                                                            <Text style={{ fontSize: 10 }} className="text-white ml-2">
                                                                {nhacNhoData[event.id] ? 'Đã nhắc nhở' : ''}
                                                            </Text>
                                                        )}
                                                    </Pressable>
                                                    {/* Chỉnh sửa */}
                                                    {(hasAccess(screenUrls.ChinhSuaLichHop, userAllowedUrls) || user?.vaiTro == 'admin') && event.trangThai !== 'dangKy' &&
                                                        <Pressable
                                                            onPress={() => { setModelEdit(true); setSelectedEvent(event); }}
                                                            className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}>
                                                            <FontAwesomeIcon color='white' icon={faEdit} size={Number(fontSize) + 4} />
                                                        </Pressable>
                                                    }
                                                    {/* Có duyền duyệt hoặc là account được uỷ quyền */}
                                                    {/* {(hasAccess(screenUrls.DuyetLichHop, userAllowedUrls) || isAccountDuyetLich || user?.vaiTro == 'admin') && event.trangThai === 'dangKy' && */}
                                                    {event.trangThai === 'dangKy' &&
                                                        <Pressable
                                                            onPress={() => { setModelEdit(true); setSelectedEvent(event); }}
                                                            className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai == 'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}>
                                                            <FontAwesomeIcon color='white' icon={faEdit} size={Number(fontSize) + 4} />
                                                        </Pressable>
                                                    }

                                                    {/* Xóa */}
                                                    {(event && event.trangThai === "dangKy") && !(hasAccess(screenUrls.DuyetLichHop, userAllowedUrls) || isAccountDuyetLich) && (
                                                        <Pressable onPress={() => { setVisibleDialog(true); setSelectedEvent(event); }} className={`p-2 ${event.trangThai === 'huy' ? 'bg-gray-500' : event.trangThai ==
                                                            'dangKy' ? 'bg-purple-500' : event.quanTrong === 1 ? 'bg-red-500' : 'bg-blue-500'} rounded-lg`}>
                                                            <FontAwesomeIcon color='white' icon={faTrash} size={Number(fontSize) + 4} />

                                                        </Pressable>
                                                    )}

                                                    <DialogComponent
                                                        open={visibleDialog}
                                                        title={'Xoá lịch họp'}
                                                        action={handleDeleteEvent}
                                                        onClose={handleCancel}
                                                        actionLabel={'Xoá'}
                                                    />
                                                </View>
                                            </View>
                                        ))}

                                    </ScrollView>
                                </View>
                            )}

                        </View>
                    </Animated.View>

                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <LichTheoTuan weekDates={weekDates} />
                    <DetailLichHopModal
                        visible={modalDetail}
                        onClose={() => { setModalDetail(false); setSelectedEvent(null) }}
                        event={selectedEvent}
                        fontSize={fontSize}
                        applyHighlight={applyHighlight}
                        parseFileAttachments={parseFileAttachments}
                        handleDownload={handleDownload}
                        publicfolder={publicfolder}
                    />
                </View>
            )
            }
            <View>
                <ReminderModal
                    visible={modalVisible}
                    onClose={handleModalClose}
                    onSelectReminder={handleReminderSelect}
                    event={selectedEvent}
                    user={user}
                />
            </View>
            {/* Button thêm mới */}
            {(hasAccess(screenUrls.ThemLichHop, userAllowedUrls) || user?.vaiTro == 'admin') &&
                <Pressable
                    onPress={() => { setModelEdit(true); setSelectedEvent(null); }}
                    className="absolute right-4 bottom-4 p-6 bg-blue-500 rounded-full shadow-lg"
                >
                    <Text><FontAwesomeIcon icon={faAdd} color='white' size={Number(fontSize) - 2} /></Text>
                </Pressable>
            }
            <View>
                <LichHopModal
                    visible={modelEdit}
                    selectedEvent={selectedEvent}
                    onClose={() => { setModelEdit(false), setSelectedEvent(null) }}
                    onCancle={handleCancleEvent}
                    onSave={handleSaveEdit}
                    onDelete={handleAcceptEvent}
                    onAccept={handleAcceptEvent}
                    user={user}
                    userAllowedUrls={userAllowedUrls}
                />
            </View>


        </View >


    );
};

export default LichHopScreen;
