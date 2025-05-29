import React, { useEffect, useState } from "react";
import { Modal, View, Text, ScrollView, Pressable, Alert, Platform, TouchableWithoutFeedback } from "react-native";
import { Checkbox, Button, TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/axiosInstance";
import { accountDuyetLichRoute, accountRoute, diaDiemHopRoute, eventRoute, lichCaNhanRoute, phanQuyenRoute, sendSMSRoute, uploadFileRoute } from "../api/baseURL";
import unidecode from 'unidecode';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Dropdown } from 'react-native-element-dropdown';
import { formatDateForSMS, removeDiacritics } from "../screens/root/LichHopScreen";

const LichCaNhanModal = ({ visible, selectedEvent, onClose, onCancle, onSave, onDelete, onAccept, user }) => {
    const [editedEvent, setEditedEvent] = useState({
        loaiSuKien: "Sự kiện công việc",
        chuDe: "",
        diaDiem: "",
        noiDung: "",
        ngayBatDau: new Date().toISOString().split('T')[0],
        gioBatDau: "08:00",
        ngayKetThuc: new Date().toISOString().split('T')[0],
        gioKetThuc: null,
        accountId: user?.id,
        fileDinhKem: "",
        trangThai: "duyet",
        quanTrong: 0,
    });
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isGioKetThucVisible, setIsGioKetThucVisible] = useState(false);
    const [diaDiemHops, setDiaDiemHops] = useState([]);

    // Hàm mở DateTimePicker
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState("date"); // 'date' hoặc 'time'
    const [pickerField, setPickerField] = useState("");
    const [valueDateTime, setValueDateTime] = useState(new Date());
    const [accountDuyetLich, setAccountDuyetLich] = useState([]);
    const [errors, setErrors] = useState({});

    // Hàm gọi api địa điểm họp
    const fetchDiaDiemHops = async () => {
        try {
            const response = await axiosInstance.get(diaDiemHopRoute.findAll);
            const formattedDiaDiemHops = response.data.map(item => ({
                label: item.tenDiaDiemHop,
                value: item.tenDiaDiemHop,
            }));
            setDiaDiemHops(formattedDiaDiemHops);
        } catch (error) {
            console.log(error);
            const errorMessage = error.response ? error.response.data.message : error.message;
            Toast.show({
                type: 'error',
                text1: errorMessage,
            });
        }
    }

    useEffect(() => {
        // Cập nhật editedEvent khi selectedEvent thay đổi
        if (selectedEvent) {
            setEditedEvent({
                loaiSuKien: selectedEvent.loaiSuKien || "Sự kiện công việc",
                chuDe: selectedEvent.chuDe || "",
                diaDiem: selectedEvent.diaDiem || "",
                noiDung: selectedEvent.noiDung || "",
                ngayBatDau: selectedEvent.ngayBatDau || "",
                gioBatDau: selectedEvent.gioBatDau || "",
                ngayKetThuc: selectedEvent.ngayKetThuc || "",
                gioKetThuc: selectedEvent.gioKetThuc != 'Inval' && selectedEvent.gioKetThuc != null ? selectedEvent.gioKetThuc : null,
                accountId: user?.id,
                fileDinhKem: selectedEvent.fileDinhKem || "",
                trangThai: selectedEvent.trangThai || "duyet",
                quanTrong: selectedEvent.quanTrong || 0,
            });
            setIsGioKetThucVisible(selectedEvent.gioKetThuc ? true : false);
        }
        setErrors({});
        fetchDiaDiemHops();
    }, [selectedEvent, user?.id]);

    // Kiểm tra tài khoản có quyền duyệt lịch không
    useEffect(() => {
        const processAccountDuyetLich = async () => {
            try {
                const response = await axiosInstance.get(accountDuyetLichRoute.findAll);

                // Lấy ngày hiện tại (chỉ lấy phần ngày)
                const currentDate = new Date();
                const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

                // Lọc tất cả các tài khoản thỏa mãn điều kiện
                const validAccounts = response.data.filter(account => {
                    const ngayBatDau = new Date(account.ngayBatDau);
                    const ngayKetThuc = new Date(account.ngayKetThuc);

                    // Chỉ lấy phần ngày của ngayBatDau và ngayKetThuc
                    const ngayBatDauOnly = new Date(ngayBatDau.getFullYear(), ngayBatDau.getMonth(), ngayBatDau.getDate());
                    const ngayKetThucOnly = new Date(ngayKetThuc.getFullYear(), ngayKetThuc.getMonth(), ngayKetThuc.getDate());

                    // Kiểm tra nếu ngày hiện tại nằm trong khoảng ngày bắt đầu và ngày kết thúc
                    return currentDateOnly >= ngayBatDauOnly && currentDateOnly <= ngayKetThucOnly;
                });

                // Gọi API để lấy danh sách accountId có URL '/lich-hop/duyet'
                const fetchChucNangForAllAccount = await axiosInstance.get(phanQuyenRoute.getChucNangForAllAccounts);
                const accountsWithSpecificUrl = fetchChucNangForAllAccount.data
                    .filter(item => item.url === '/lich-hop/duyet')
                    .map(item => item.accountId); // Lấy ra accountId

                // Fetch các accountId từ username trong validAccounts
                const accountIdsFromValidAccounts = await Promise.all(validAccounts.map(async account => {
                    const accountResponse = await axiosInstance.get(accountRoute.findByUsername + "/" + account.username); // Giả sử API trả về accountId
                    return accountResponse.data.id; // Lấy accountId từ response
                }));

                // Fetch ra các tài khoản có vaiTro là admin
                const fetchAdminAccounts = await axiosInstance.get(accountRoute.findAll);
                const adminAccounts = fetchAdminAccounts.data.filter(account => account.vaiTro === "admin").map(account => account.id);

                // Gộp hai danh sách
                const accountDuyetLich = [
                    ...accountIdsFromValidAccounts, // Lấy username từ validAccounts
                    ...accountsWithSpecificUrl, // Lấy accountId từ accountsWithSpecificUrl
                    ...adminAccounts, // Lấy accountId từ adminAccounts
                ];

                // Loại bỏ các phần tử trùng lặp
                const uniqueAccountDuyetLich = [...new Set(accountDuyetLich)];

                // Lưu danh sách tài khoản hợp lệ vào state
                setAccountDuyetLich(uniqueAccountDuyetLich);

                console.log('Danh sách tài khoản hợp lệ:', uniqueAccountDuyetLich);

            } catch (error) {
                console.error('Failed to fetch accounts for duyet lich:', error);
                const errorMessage = error.response ? error.response.data.message : error.message;
                Toast.show({
                    type: 'error',
                    text1: errorMessage,
                });
            }
        };
        processAccountDuyetLich();
    }, []);

    // Lưu sự kiện
    const handleSave = async () => {
        const newErrors = {};
        if (!editedEvent.loaiSuKien) newErrors.loaiSuKien = "Vui lòng chọn loại sự kiện";
        if (!editedEvent.chuDe) newErrors.chuDe = "Vui lòng nhập chủ đề";
        if (!editedEvent.diaDiem) newErrors.diaDiem = "Vui lòng chọn địa điểm";
        if (!editedEvent.noiDung) newErrors.noiDung = "Vui lòng nhập nội dung";
        if (!editedEvent.ngayBatDau) newErrors.ngayBatDau = "Vui lòng chọn ngày bắt đầu";
        if (!editedEvent.gioBatDau) newErrors.gioBatDau = "Vui lòng chọn giờ bắt đầu";
        if (!editedEvent.ngayKetThuc) newErrors.ngayKetThuc = "Vui lòng chọn ngay kết thúc";
        //if (!editedEvent.gioKetThuc) newErrors.gioKetThuc = "Vui lòng chọn giờ kết thúc";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }

        // kiểm tra giờ bắt đầu không được bằng với giờ kết thúc
        if (editedEvent.gioKetThuc && editedEvent.gioBatDau === editedEvent.gioKetThuc) {
            Alert.alert("Lỗi", "Giờ bắt đầu không được bằng với giờ kết thúc");
            return;
        }

        const ngayBatDau = new Date(editedEvent.ngayBatDau + ' ' + editedEvent.gioBatDau);
        const ngayKetThuc = editedEvent.gioKetThuc ? new Date(editedEvent.ngayKetThuc + ' ' + editedEvent.gioKetThuc) : new Date(editedEvent.ngayBatDau + ' ' + editedEvent.gioBatDau);

        // Kiểm tra ngày bắt đầu nhỏ hơn ngày kết thúc
        if (ngayBatDau.toISOString().split('T')[0] > ngayKetThuc.toISOString().split('T')[0]) {
            Alert.alert("Lỗi", "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
            return;
        }

        // Kiểm tra nếu ngày bắt đầu bằng ngày kết thúc thì giờ kết thúc phải luôn lớn hơn giờ bắt đầu
        if (editedEvent.gioKetThuc && ngayBatDau.toLocaleDateString() === ngayKetThuc.toLocaleDateString()) {
            if (ngayBatDau >= ngayKetThuc) {
                Alert.alert("Lỗi", "Giờ kết thúc phải lớn hơn giờ bắt đầu");
                return;
            }
        }

        // Nếu có file đính kèm thì gọi API upload file trước
        if (attachedFiles.length > 0) {
            const formData = new FormData();

            attachedFiles.forEach((file) => {
                formData.append("files", {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                });
            })

            try {
                const response = await axiosInstance.post(uploadFileRoute.uploadFile, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                // Nếu lỗi thì dừng
                if (response.status < 200 || response.status >= 300) {
                    Alert.alert("Lỗi", response.data.message);
                    return;
                }

            } catch (error) {
                console.log(error);
                const errorMessage = error.response ? error.response.data.message : error.message;
                Alert.alert("Lỗi", errorMessage);
                return;
            }
        }

        try {
            let response;
            if (selectedEvent) {
                // Gọi API để cập nhật sự kiện
                response = await axiosInstance.put(`${lichCaNhanRoute.update}/${selectedEvent.id}`, editedEvent);
            } else {
                // Gọi API để tạo sự kiện mới
                response = await axiosInstance.post(lichCaNhanRoute.create, editedEvent);
            }

            if (response.status >= 200 && response.status < 300) {
                Toast.show({
                    type: 'success',
                    text1: response.data.message,
                });
                onSave();
                handleCloseModal();
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

    // Xóa sự kiện
    const handleDeleteEvent = async () => {
        try {
            const response = await axiosInstance.delete(lichCaNhanRoute.delete + "/" + selectedEvent.id);
            if (response.status >= 200 && response.status < 300) {
                Toast.show({
                    type: 'success',
                    text1: response.data.message,
                });
                handleCloseModal();
                onDelete();
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

    // Sự kiện Duyệt event
    const handleAcceptEvent = async () => {
        try {
            const response = await axiosInstance.put(lichCaNhanRoute.update + "/" + selectedEvent.id, { trangThai: "duyet" });
            if (response.status >= 200 && response.status < 300) {
                Toast.show({
                    type: 'success',
                    text1: response.data.message,
                });
                handleCloseModal();
                onAccept();
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

    // Sự kiện Huỷ event
    const handleCancleEvent = async () => {
        try {
            const response = await axiosInstance.put(lichCaNhanRoute.update + "/" + selectedEvent.id, { trangThai: "huy" });
            if (response.status >= 200 && response.status < 300) {
                Toast.show({
                    type: 'success',
                    text1: response.data.message,
                });
                handleCloseModal();
                onCancle();
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

    // Đăng ký lịch VTT
    const handleTranferToLichHop = async () => {
        try {
            const response = await axiosInstance.put(lichCaNhanRoute.update + "/" + selectedEvent.id, { trangThai: "dangKy" });
            if (response.status < 200 || response.status >= 300) {
                return Toast.show({
                    type: 'success',
                    text1: response.data.message,
                });
            }
            const data = {
                ngayBatDau: editedEvent.ngayBatDau,
                gioBatDau: editedEvent.gioBatDau,
                ngayKetThuc: editedEvent.ngayKetThuc,
                gioKetThuc: editedEvent.gioKetThuc ? editedEvent.gioKetThuc : null,
                noiDungCuocHop: editedEvent.chuDe,
                chuTri: user?.name,
                chuanBi: "",
                thanhPhan: user?.name,
                moi: "",
                diaDiem: editedEvent.diaDiem,
                ghiChu: editedEvent.noiDung,
                fileDinhKem: editedEvent.fileDinhKem,
                trangThai: "dangKy",
                accountId: user?.id,
                quanTrong: editedEvent.quanTrong,
            }
            const responseLichHop = await axiosInstance.post(eventRoute.create, data);
            if (responseLichHop.status < 200 || responseLichHop.status >= 300) {
                return Toast.show({
                    type: 'success',
                    text1: responseLichHop.data.message,
                });
            }
            Toast.show({
                type: 'success',
                text1: "Đăng ký lịch VTT thành công",
            });
            onAccept();
            const smsPromises = accountDuyetLich.map(async (accountId) => {
                // Lấy thông tin tài khoản từ API theo accountId
                const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + accountId);
                const account = responseAccount.data;

                // Nếu account.phone null thì bỏ qua
                if (!account.phone) {
                    return;
                }
                //console.log(removeAccents(data.noiDungCuocHop))
                // Gửi SMS cho tài khoản này
                try {
                    await axiosInstance.post(sendSMSRoute.sendSMS, {
                        phonenumber: account.phone,
                        content: 'Lich hop BRVT: [Trang thai: Dang ky] ' + removeDiacritics(data.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${data.ngayBatDau}T${data.gioBatDau}:00`))
                    });
                } catch (error) {
                    // Nếu có lỗi trong quá trình gửi SMS
                    Toast.show({
                        type: 'error',
                        text1: 'Gửi SMS thất bại cho ' + account.phone,
                    });
                }
            });

            // Chờ tất cả các Promise hoàn thành
            await Promise.all(smsPromises);
            handleCloseModal(); // Đóng modal
        } catch (error) {
            console.log(error);
            const errorMessage = error.response ? error.response.data.message : error.message;
            Toast.show({
                type: 'error',
                text1: errorMessage,
            });
        }
    };

    // Huỷ đăng ký lịch VTT
    const handleCancleTranferToLichHop = async () => {
        try {
            const response = await axiosInstance.put(lichCaNhanRoute.update + "/" + selectedEvent.id, { trangThai: "duyet" });
            if (response.status < 200 || response.status >= 300) {
                return Toast.show({
                    type: 'success',
                    text1: response.data.message,
                });
            }
            const responseLichHop = await axiosInstance.get(eventRoute.findAll);

            // Sắp xếp lại danh sách lịch họp theo id
            responseLichHop.data.sort((a, b) => b.id - a.id).forEach(async (item) => {
                // Nếu chủ trì là tên của bạn và trạng thái là đăng ký thì xóa sau đó dừng vòng lặp, đảm bảo chỉ xoá 1 sự kiện
                if (item.chuTri === user?.name && item.trangThai === "dangKy" && item.ngayBatDau == editedEvent.ngayBatDau && item.gioBatDau == editedEvent.gioBatDau && item.ngayKetThuc == editedEvent.ngayKetThuc) {
                    await axiosInstance.delete(eventRoute.delete + "/" + item.id);
                    return;
                }
            })
            Toast.show({
                type: 'success',
                text1: "Huỷ đăng ký lịch VTT thành công",
            });
            onAccept(); // Cập nhật danh sách sự kiện
            handleCloseModal();
        } catch (error) {
            console.log(error);
            const errorMessage = error.response ? error.response.data.message : error.message;
            Toast.show({
                type: 'error',
                text1: errorMessage,
            });
        }
    };

    // Hàm chọn ngày giờ
    const handleDatePickerChange = (field, event, selectedDate) => {
        if (event.type === "dismissed") {
            setShowPicker(false);
            return;
        }

        let formattedValue = '';
        if (field?.includes('ngay') || (pickerMode === "date" && Platform.OS !== 'ios')) {
            // Nếu trường là Ngày
            formattedValue = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (field?.includes('gio') || (pickerMode === "time" && Platform.OS !== 'ios')) {
            // Nếu trường là Giờ
            formattedValue = selectedDate ? selectedDate.toTimeString().split(' ')[0].substring(0, 5) : ""; // HH:mm
        }

        if (field) {
            setEditedEvent((prevState) => {
                const updatedEvent = {
                    ...prevState,
                    [field]: formattedValue,
                };

                // Kiểm tra nếu giờ bắt đầu thay đổi, cập nhật giờ kết thúc
                if (field === "gioBatDau") {
                    const [hours, minutes] = formattedValue.split(":").map(Number);
                    const startTime = new Date();
                    startTime.setHours(hours, minutes);

                    // Thêm 60 phút
                    const endTime = new Date(startTime);
                    endTime.setMinutes(startTime.getMinutes() + 60);

                    //updatedEvent.gioKetThuc = endTime.toTimeString().split(" ")[0].substring(0, 5); // HH:mm
                }
                // Kiểm tra nếu ngày bắt đầu thay đổi, cập nhật ngày kết thúc bằng ngày bắt đầu
                if (field === "ngayBatDau") {
                    updatedEvent.ngayKetThuc = formattedValue;
                }
                return updatedEvent;
            });
        } else {
            setEditedEvent(prevState => {
                const updatedEvent = {
                    ...prevState,
                    [pickerField]: formattedValue,
                };
                // Kiểm tra nếu giờ bắt đầu thay đổi, cập nhật giờ kết thúc
                if (pickerField === "gioBatDau") {
                    const [hours, minutes] = formattedValue.split(":").map(Number);
                    const startTime = new Date();
                    startTime.setHours(hours, minutes);

                    // Thêm 60 phút
                    const endTime = new Date(startTime);
                    endTime.setMinutes(startTime.getMinutes() + 60);

                    //updatedEvent.gioKetThuc = endTime.toTimeString().split(" ")[0].substring(0, 5); // HH:mm
                }
                // Kiểm tra nếu ngày bắt đầu thay đổi, cập nhật ngày kết thúc bằng ngày bắt đầu
                if (pickerField === "ngayBatDau") {
                    updatedEvent.ngayKetThuc = formattedValue;
                }
                // Đóng picker sau khi trạng thái được cập nhật
                setShowPicker(false);

                return updatedEvent;
            });
        }
    };

    const openPicker = (mode, field, value) => {
        setPickerMode(mode);
        setPickerField(field);
        setShowPicker(true);
        setValueDateTime(new Date(value))
    };

    // Hàm chọn file
    const handleFileChange = async () => {
        try {
            // Cho phép người dùng chọn nhiều file
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*", // Cho phép tất cả các loại file
                multiple: true, // Cho phép chọn nhiều file
            });

            // Kiểm tra nếu người dùng hủy
            if (result.canceled) {
                return;
            } 
            // Kiểm tra số lượng file (tối đa 5 file)
            if (result.assets[0].length > 5) {
                Toast.show({
                    type: "error",
                    text1: "Chỉ được phép tải lên tối đa 5 tệp",
                    position: 'top',
                    visibilityTime: 3000,
                });
                return;
            }
            //console.log(result)
            // Kiểm tra định dạng file (chỉ cho phép .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf)
            const allowedExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf'];
            const invalidFiles = result.assets.filter(file => {
                const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
                return !allowedExtensions.includes(fileExtension);
            });

            if (invalidFiles.length > 0) {
                Alert.alert("Lỗi", "Chỉ được phép tải lên các tệp DOC, DOCX, XLS, XLSX, PPT, PPTX, PDF");
                return;
            }

            const now = new Date();
            const dateStr = formatDateToISO(now);
            const newFiles = result.assets.map(file => {
                return {
                    uri: file.uri,
                    name: unidecode(dateStr + "_" + file.name),
                    type: file.mimeType,
                };
            });

            // Lưu các file vào state
            setAttachedFiles(newFiles);
            setEditedEvent({ ...editedEvent, fileDinhKem: JSON.stringify(newFiles.map(file => file.name)) });
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi chọn file.");
        }
    };

    const formatDateToISO = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    }

    // Hàm kiểm tra JSON và trả về mảng file hoặc mảng rỗng
    const parseFileAttachments = (fileDinhKem) => {
        if (typeof fileDinhKem === "string") {
            try {
                const parsed = JSON.parse(fileDinhKem);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                //console.log("JSON parsing error:", error);
                return [];
            }
        }
        return [];
    };

    const handleCloseModal = () => {
        setEditedEvent({
            loaiSuKien: "Sự kiện công việc",
            chuDe: "",
            diaDiem: "",
            noiDung: "",
            ngayBatDau: new Date().toISOString().split('T')[0],
            gioBatDau: "08:00",
            ngayKetThuc: new Date().toISOString().split('T')[0],
            gioKetThuc: null,
            accountId: user?.id,
            fileDinhKem: "",
            trangThai: "duyet",
            quanTrong: 0,
        });
        setErrors({});
        setAttachedFiles([]);
        onClose();
    }

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={handleCloseModal}>
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View className="bg-white w-96 rounded-lg p-4 my-8">
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <Text className="text-xl font-bold text-center mb-4">{selectedEvent ? "Sửa lịch" : "Thêm lịch"}</Text>

                        {/* Quan trọng */}
                        <View className="flex-row items-center mb-4">
                            <BouncyCheckbox
                                isChecked={editedEvent.quanTrong === 1 ? true : false}
                                onPress={() => setEditedEvent({
                                    ...editedEvent,
                                    quanTrong: editedEvent.quanTrong === 1 ? 0 : 1
                                })}
                                fillColor="blue"
                                text="Quan trọng"
                                textStyle={{
                                    textDecorationLine: "none",
                                }}
                                disabled={editedEvent.trangThai === "dangKy"}
                            />
                        </View>

                        {/* Loại sự kiện */}
                        <View className="mb-2">
                            <View className="border rounded-md w-full relative">
                                <Text className="absolute left-3 -top-3 bg-white text-sm px-1">Loại sự kiện *</Text>
                                <Dropdown
                                    data={[
                                        { label: 'Sự kiện công việc', value: 'Sự kiện công việc' },
                                        { label: 'Vắng mặt', value: 'Vắng mặt' },
                                        { label: 'Riêng tư', value: 'Riêng tư' },
                                    ]}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Chọn loại sự kiện"
                                    searchPlaceholder="Tìm kiếm"
                                    value={editedEvent.loaiSuKien} // Giá trị hiện tại
                                    onChange={item => setEditedEvent({ ...editedEvent, loaiSuKien: item.value })} // Cập nhật giá trị
                                    search={true}
                                    style={{ padding: 10 }}
                                    disable={editedEvent.trangThai === "dangKy"}
                                />
                            </View>

                        </View>
                        {/* Chủ đề */}
                        <View className="mb-4">
                            <TextInput
                                label="Chủ đề *"
                                mode="outlined"
                                value={editedEvent.chuDe}
                                onChangeText={(text) => setEditedEvent({ ...editedEvent, chuDe: text })}
                                readOnly={editedEvent.trangThai === "dangKy"}
                                error={errors.chuDe}
                            />
                        </View>


                        {/* Địa điểm */}
                        <View className="mb-2">
                            <View className="border rounded-md w-full relative">
                                <Text className="absolute left-3 -top-3 bg-white text-sm px-1">Địa điểm, phương tiện *</Text>
                                <Dropdown
                                    data={diaDiemHops}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Chọn địa điểm"
                                    searchPlaceholder="Tìm kiếm"
                                    value={editedEvent.diaDiem} // Giá trị hiện tại
                                    onChange={item => setEditedEvent({ ...editedEvent, diaDiem: item.value })} // Cập nhật giá trị
                                    search={true}
                                    style={{ padding: 10 }}
                                    disable={editedEvent.trangThai === "dangKy"}
                                />
                                {errors.diaDiem && <Text className="text-red-500 text-sm ml-2">{errors.diaDiem}</Text>}
                            </View>
                        </View>
                        {/* Nội dung */}
                        <View className="mb-4">
                            <TextInput
                                label="Ghi chú *"
                                mode="outlined"
                                multiline
                                numberOfLines={2}
                                value={editedEvent.noiDung}
                                onChangeText={(text) => setEditedEvent({ ...editedEvent, noiDung: text })}
                                readOnly={editedEvent.trangThai === "dangKy"}
                                error={errors.noiDung}
                            />
                        </View>


                        {/* Ngày và giờ bắt đầu */}
                        <View className="mb-4">
                            {/* Nếu platform là ios thì hiện datetime picker */}
                            {Platform.OS === 'ios' ? (
                                <View className="flex flex-row justify-start items-center">
                                    <Text className="text-base font-semibold w-1/4">Ngày giờ bắt đầu *</Text>
                                    <DateTimePicker
                                        style={{ width: '33%' }}
                                        value={editedEvent.ngayBatDau ? new Date(editedEvent.ngayBatDau) : new Date().toISOString().split('T')[0]}
                                        mode="date"
                                        display="default"
                                        onChange={(event, date) => handleDatePickerChange('ngayBatDau', event, date)}
                                        locale="vi-VN"
                                        disabled={editedEvent.trangThai === "dangKy"}
                                    />
                                    <DateTimePicker
                                        style={{ width: '33%' }}
                                        value={editedEvent.gioBatDau ? new Date(`2000-01-01T${editedEvent.gioBatDau}:00`) : '08:00'}
                                        mode="time"
                                        display="default"
                                        onChange={(event, date) => handleDatePickerChange('gioBatDau', event, date)}
                                        locale="vi-VN"
                                        disabled={editedEvent.trangThai === "dangKy"}
                                    />
                                </View>
                            ) : (
                                <View className="flex flex-row justify-between items-center">
                                    <Pressable className="w-7/12" onPress={() => openPicker('date', 'ngayBatDau', editedEvent.ngayBatDau)} disabled={editedEvent.trangThai === "dangKy"}>
                                        <TextInput
                                            label="Ngày bắt đầu *"
                                            mode="outlined"
                                            value={editedEvent.ngayBatDau}
                                            editable={false}
                                        />
                                    </Pressable>
                                    <Pressable className="w-4/12" onPress={() => openPicker("time", "gioBatDau", `2000-01-01T${editedEvent.gioBatDau}`)} disabled={editedEvent.trangThai === "dangKy"}>
                                        <TextInput
                                            label="Giờ bắt đầu *"
                                            mode="outlined"
                                            value={editedEvent.gioBatDau}
                                            editable={false}
                                        />
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        {/* Ngày và giờ kết thúc */}
                        <View className="mb-4">
                            {/* Nếu platform là ios thì hiện datetime picker */}
                            {Platform.OS === 'ios' ? (
                                <>
                                    <View className="flex flex-row justify-start items-center">
                                        <Text className="text-base font-semibold w-1/4">Ngày giờ kết thúc *</Text>
                                        <DateTimePicker
                                            style={{ width: '33%' }}
                                            value={editedEvent.ngayKetThuc ? new Date(editedEvent.ngayKetThuc) : new Date().toISOString().split('T')[0]}
                                            mode="date"
                                            display="default"
                                            onChange={(event, date) => handleDatePickerChange('ngayKetThuc', event, date)}
                                            locale="vi-VN"
                                            disabled={editedEvent.trangThai === "dangKy"}
                                        />
                                        {isGioKetThucVisible && (
                                            <DateTimePicker
                                                style={{ width: '33%' }}
                                                value={editedEvent.gioKetThuc ? new Date(`2000-01-01T${editedEvent.gioKetThuc}:00`) : new Date()}
                                                mode="time"
                                                display="default"
                                                onChange={(event, date) => handleDatePickerChange('gioKetThuc', event, date)}
                                                locale="vi-VN"
                                                disabled={editedEvent.trangThai === "dangKy"}
                                            />
                                        )}
                                    </View>
                                    {isGioKetThucVisible && (
                                        <Pressable onPress={() => { setIsGioKetThucVisible(false); editedEvent.gioKetThuc = null }}>
                                            <Text className="text-blue-500">Xoá thời gian kết thúc</Text>
                                        </Pressable>
                                    )}
                                    {!isGioKetThucVisible && (
                                        <Pressable onPress={() => { setIsGioKetThucVisible(true); editedEvent.gioKetThuc = new Date().toTimeString().slice(0, 5) }}>
                                            <Text className="text-blue-500">Chọn thời gian kết thúc</Text>
                                        </Pressable>
                                    )}
                                </>
                            ) : (
                                <View className="flex flex-row justify-between items-center">
                                    <Pressable className="w-7/12" onPress={() => openPicker('date', 'ngayKetThuc', editedEvent.ngayKetThuc)} disabled={editedEvent.trangThai === "dangKy"}>
                                        <TextInput
                                            label="Ngày kết thúc *"
                                            mode="outlined"
                                            value={editedEvent.ngayKetThuc}
                                            editable={false}
                                        />
                                    </Pressable>
                                    <Pressable className="w-4/12" onPress={() => openPicker("time", "gioKetThuc", `2000-01-01T${editedEvent.gioKetThuc}`)} disabled={editedEvent.trangThai === "dangKy"}>
                                        <TextInput
                                            label="Giờ kết thúc *"
                                            mode="outlined"
                                            value={editedEvent.gioKetThuc}
                                            editable={false}
                                        />
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Tệp đính kèm</Text>
                            <Pressable onPress={handleFileChange} disabled={editedEvent.trangThai === "dangKy"}>
                                <Text className="text-blue-500">Chọn tệp</Text>
                            </Pressable>
                            <View className="mt-2">
                                {parseFileAttachments(editedEvent.fileDinhKem).map((file, index) => (
                                    <View key={index} className="flex-row items-center">
                                        <Text className="text-base">{file}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Hiển thị DateTimePicker */}
                        {showPicker && (
                            <DateTimePicker
                                value={valueDateTime}
                                mode={pickerMode}
                                display="default"
                                onChange={(event, date) => handleDatePickerChange(null, event, date)}
                            />
                        )}

                        {/* Buttons */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                            <Button onPress={handleCloseModal} mode="text" textColor="black">
                                Đóng
                            </Button>
                            {selectedEvent && (selectedEvent.trangThai === "duyet" || selectedEvent.trangThai === "quanTrong") && (
                                <Button onPress={handleCancleEvent} mode="text" textColor="red">
                                    Tắt
                                </Button>
                            )}
                            {selectedEvent && (selectedEvent.trangThai === "huy" || selectedEvent.trangThai === "quanTrong") && (
                                <Button onPress={handleAcceptEvent} mode="text">
                                    Bật
                                </Button>
                            )}
                            {selectedEvent && selectedEvent.trangThai === "dangKy" ?
                                <></>
                                :
                                <Button onPress={handleSave}>
                                    Lưu
                                </Button>
                            }

                            {selectedEvent && selectedEvent.trangThai !== "dangKy" && (
                                <Button onPress={handleDeleteEvent} mode="text" textColor="red">
                                    Xóa
                                </Button>
                            )}
                        </ScrollView>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                            {selectedEvent && selectedEvent.trangThai !== "dangKy" && (
                                <Button onPress={handleTranferToLichHop} mode="text" textColor="black">
                                    Đăng ký lịch VTT
                                </Button>
                            )}
                            {selectedEvent && selectedEvent.trangThai === "dangKy" && (
                                <Button onPress={handleCancleTranferToLichHop} mode="text" textColor="black">
                                    Huỷ đăng ký lịch VTT
                                </Button>
                            )}
                        </ScrollView>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default LichCaNhanModal;
