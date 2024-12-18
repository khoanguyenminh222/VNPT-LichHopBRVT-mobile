import React, { useEffect, useState } from "react";
import { Modal, View, Text, ScrollView, Pressable, Alert, Platform, TouchableWithoutFeedback } from "react-native";
import { Checkbox, Button, TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/axiosInstance";
import { accountRoute, diaDiemHopRoute, eventRoute, lichCaNhanRoute, thanhPhanThamDuRoute, uploadFileRoute } from "../api/baseURL";
import unidecode from 'unidecode';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Dropdown } from 'react-native-element-dropdown';
import TreeSelectModal from "./TreeSelectModal";

const LichHopModal = ({ visible, selectedEvent, onClose, onCancle, onSave, onDelete, onAccept, user }) => {
    const [editedEvent, setEditedEvent] = useState({
        noiDungCuocHop: "",
        chuTri: "",
        chuanBi: "",
        thanhPhan: "",
        ghiChuThanhPhan: "",
        moi: "",
        diaDiem: "Ngoài cơ quan",
        ghiChu: "",
        ngayBatDau: new Date().toISOString().split('T')[0],
        gioBatDau: "08:00",
        ngayKetThuc: new Date().toISOString().split('T')[0],
        gioKetThuc: "09:00",
        fileDinhKem: "",
        trangThai: "",
    });
    const [attachedFiles, setAttachedFiles] = useState([]);

    const [chuTris, setChuTris] = useState([]);
    const [diaDiemHops, setDiaDiemHops] = useState([]);
    const [thanhPhanThamDus, setThanhPhanThamDus] = useState([]);
    const [thanhPhanSelectModalVisible, setThanhPhanSelectModalVisible] = useState(false);
    const [chuTriSelectModalVisible, setChuTriSelectModalVisible] = useState(false);
    // Hàm mở DateTimePicker
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState("date"); // 'date' hoặc 'time'
    const [pickerField, setPickerField] = useState("");
    const [valueDateTime, setValueDateTime] = useState(new Date());

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

    // Gọi api lấy ra thành phần tham dự
    const fetchThanhPhanThamDu = async () => {
        try {
            const response = await axiosInstance.get(thanhPhanThamDuRoute.findAll);
            if (response.status >= 200 && response.status < 300) {
                setThanhPhanThamDus(response.data.filter(item => item.idCotCha === null));
            }
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : error.message;
            console.log(errorMessage);
        }
    };

    // Gọi api lấy ra account lưu vào chuTris
    const fetchChuTris = async () => {
        try {
            const response = await axiosInstance.get(accountRoute.findAll);
            if (response.status >= 200 && response.status < 300) {

                const formattedChuTris = response.data.map(item => ({
                    label: item.name,
                    value: item.name,
                }));
                setChuTris(formattedChuTris);
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

    useEffect(() => {
        // Cập nhật editedEvent khi selectedEvent thay đổi
        if (selectedEvent) {
            setEditedEvent({
                noiDungCuocHop: selectedEvent.noiDungCuocHop,
                chuTri: selectedEvent.chuTri,
                chuanBi: selectedEvent.chuanBi,
                thanhPhan: selectedEvent.thanhPhan,
                ghiChuThanhPhan: selectedEvent.ghiChuThanhPhan,
                moi: selectedEvent.moi,
                diaDiem: selectedEvent.diaDiem,
                ghiChu: selectedEvent.ghiChu,
                ngayBatDau: selectedEvent.ngayBatDau,
                gioBatDau: selectedEvent.gioBatDau,
                ngayKetThuc: selectedEvent.ngayKetThuc,
                gioKetThuc: selectedEvent.gioKetThuc,
                fileDinhKem: selectedEvent.fileDinhKem,
                trangThai: selectedEvent.trangThai,
            });
        }
        fetchDiaDiemHops();
        fetchThanhPhanThamDu();
        fetchChuTris();
    }, [selectedEvent, user?.id]);

    // Lưu sự kiện
    const handleSave = async () => {
        console.log(editedEvent)
        if (!editedEvent.noiDungCuocHop || !editedEvent.chuTri || (!editedEvent.thanhPhan && !editedEvent.ghiChuThanhPhan) || !editedEvent.diaDiem || !editedEvent.ngayBatDau || !editedEvent.gioBatDau || !editedEvent.ngayKetThuc || !editedEvent.gioKetThuc) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        // kiểm tra giờ bắt đầu không được bằng với giờ kết thúc
        if (editedEvent.gioBatDau === editedEvent.gioKetThuc) {
            Alert.alert("Lỗi", "Giờ bắt đầu không được bằng với giờ kết thúc");
            return;
        }

        const ngayBatDau = new Date(editedEvent.ngayBatDau + ' ' + editedEvent.gioBatDau);
        const ngayKetThuc = new Date(editedEvent.ngayKetThuc + ' ' + editedEvent.gioKetThuc);

        // Kiểm tra ngày bắt đầu nhỏ hơn ngày kết thúc
        if (ngayBatDau.toISOString().split('T')[0] > ngayKetThuc.toISOString().split('T')[0]) {
            Alert.alert("Lỗi", "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
            return;
        }

        // Kiểm tra nếu ngày bắt đầu bằng ngày kết thúc thì giờ kết thúc phải luôn lớn hơn giờ bắt đầu
        if (ngayBatDau.toLocaleDateString() === ngayKetThuc.toLocaleDateString()) {
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
        editedEvent.trangThai == "" ? editedEvent.trangThai = "dangKy" : editedEvent.trangThai;
        try {
            let response;
            if (selectedEvent) {
                // Gọi API để cập nhật sự kiện
                response = await axiosInstance.put(`${eventRoute.update}/${selectedEvent.id}`, editedEvent);
            } else {
                // Gọi API để tạo sự kiện mới
                response = await axiosInstance.post(eventRoute.create, editedEvent);
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
            const response = await axiosInstance.delete(eventRoute.delete + "/" + selectedEvent.id);
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
            if (editedEvent.trangThai === "dangKy") {
                const responseLichCaNhan = await axiosInstance.get(lichCaNhanRoute.findAll);
                responseLichCaNhan.data.sort((a, b) => b.id - a.id).forEach(async (item) => {
                    // Lấy thông tin tài khoản theo id
                    const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + item.accountId);
                    const account = responseAccount.data;

                    // Kiểm tra nếu có sự kiện trùng lặp
                    if (item.accountId == account.id &&
                        item.trangThai == "dangKy" &&
                        item.ngayBatDau == editedEvent.ngayBatDau &&
                        item.gioBatDau == editedEvent.gioBatDau &&
                        item.ngayKetThuc == editedEvent.ngayKetThuc &&
                        item.gioKetThuc == editedEvent.gioKetThuc) {
                        // Cập nhật trạng thái sự kiện thành đã duyệt
                        await axiosInstance.put(lichCaNhanRoute.update + "/" + item.id, { trangThai: "duyet" });
                        return;
                    }
                });
            }

            const response = await axiosInstance.put(eventRoute.update + "/" + selectedEvent.id, { trangThai: "duyet" });
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
            // Kiểm tra nếu trangThai là đăng ký thì tìm trong bảng lịch cá nhân xem có sự kiện nào trùng không
            if (editedEvent.trangThai === "dangKy") {
                const responseLichCaNhan = await axiosInstance.get(lichCaNhanRoute.findAll);
                responseLichCaNhan.data.sort((a, b) => b.id - a.id).forEach(async (item) => {
                    // Lấy thông tin tài khoản theo id
                    const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + item.accountId);
                    const account = responseAccount.data;

                    // Kiểm tra nếu có sự kiện trùng lặp
                    if (item.accountId == account.id &&
                        item.trangThai == "dangKy" &&
                        item.ngayBatDau == editedEvent.ngayBatDau &&
                        item.gioBatDau == editedEvent.gioBatDau &&
                        item.ngayKetThuc == editedEvent.ngayKetThuc &&
                        item.gioKetThuc == editedEvent.gioKetThuc) {
                        // Cập nhật trạng thái sự kiện thành đã duyệt
                        await axiosInstance.put(lichCaNhanRoute.update + "/" + item.id, { trangThai: "duyet" });
                        return;
                    }
                });
            }

            const response = await axiosInstance.put(eventRoute.update + "/" + selectedEvent.id, { trangThai: "huy" });
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
            formattedValue = selectedDate.toTimeString().split(' ')[0].substring(0, 5); // HH:mm
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

                    updatedEvent.gioKetThuc = endTime.toTimeString().split(" ")[0].substring(0, 5); // HH:mm
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

                    updatedEvent.gioKetThuc = endTime.toTimeString().split(" ")[0].substring(0, 5); // HH:mm
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
            if (result.assets[0].type === 'canceled') {
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
            noiDungCuocHop: "",
            chuTri: "",
            chuanBi: "",
            thanhPhan: "",
            ghiChuThanhPhan: "",
            moi: "",
            diaDiem: "Ngoài cơ quan",
            ghiChu: "",
            ngayBatDau: new Date().toISOString().split('T')[0],
            gioBatDau: "08:00",
            ngayKetThuc: new Date().toISOString().split('T')[0],
            gioKetThuc: "09:00",
            fileDinhKem: "",
            trangThai: "",
        });
        setAttachedFiles([]);
        onClose();
    }

    // Xử lý khi người dùng chọn thành phần
    const handleSelection = (selectedItems, field) => {
        // Kiểm tra mảng selectedItems có phù hợp không, mảng selectedItems đúng sẽ có dạng ["Tên thành phần 1", "Tên thành phần 2"]
        const hasUnselectedItem = selectedItems.some(item => item.tenThanhPhan);
        if (hasUnselectedItem) {
            return;
        }
        const selectedNames = selectedItems.join(', ');
        setEditedEvent({ ...editedEvent, [field]: selectedNames });
    };
    const updateTreeSelection = (data, selectedNames, titleKey) => {
        return data.map((item) => ({
            ...item,
            isSelected: selectedNames.includes(item[titleKey]), // Đánh dấu checkbox nếu tên nằm trong mảng selectedNames
            children: item.children
                ? updateTreeSelection(item.children, selectedNames, titleKey) // Đệ quy để cập nhật con
                : [],
        }));
    };

    const handleOpenSelect = (type) => {
        const selectedNames = editedEvent[type]
            ? editedEvent[type].split(', ').map((name) => name.trim()) // Tách chuỗi thành mảng
            : [];
        const updatedData = updateTreeSelection(thanhPhanThamDus, selectedNames, "tenThanhPhan");

        if (type === 'thanhPhan') {
            setThanhPhanSelectModalVisible(true);
        } else if (type === 'chuTri') {
            setChuTriSelectModalVisible(true);
        }

        setThanhPhanThamDus(updatedData); // Cập nhật dữ liệu cho TreeSelect
    };
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={handleCloseModal}>
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View className="bg-white w-96 rounded-lg p-4 my-8">
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text className="text-xl font-bold text-center mb-4 fixed top-0">{selectedEvent ? "Sửa sự kiện" : "Thêm sự kiện"}</Text>

                                {/* Quan trọng */}
                                <View className="flex-row items-center mb-4">
                                    <BouncyCheckbox
                                        isChecked={editedEvent.trangThai === "quanTrong" ? true : false}
                                        onPress={() => setEditedEvent({
                                            ...editedEvent,
                                            trangThai: editedEvent.trangThai === "quanTrong" ? "duyet" : "quanTrong"
                                        })}
                                        fillColor="blue"
                                        text="Quan trọng"
                                        textStyle={{
                                            textDecorationLine: "none",
                                        }}
                                        disabled={editedEvent.trangThai === "dangKy"}
                                    />
                                </View>

                                {/* Nội dung cuộc họp */}
                                <View className="mb-2">
                                    <TextInput
                                        label="Nội dung cuộc họp *"
                                        mode="outlined"
                                        value={editedEvent.noiDungCuocHop}
                                        onChangeText={(text) => setEditedEvent({ ...editedEvent, noiDungCuocHop: text })}
                                        readOnly={editedEvent.trangThai === "dangKy"}
                                    />
                                </View>
                                {/* Chủ trì */}
                                <View className="mb-2">
                                    <TextInput
                                        value={editedEvent.chuTri}
                                        onFocus={() => handleOpenSelect('chuTri')}
                                        readOnly={editedEvent.trangThai === "dangKy"}
                                        label="Chủ trì *"
                                        mode="outlined"
                                    />

                                    <TreeSelectModal
                                        visible={chuTriSelectModalVisible}
                                        onClose={() => setChuTriSelectModalVisible(false)}
                                        onSelect={handleSelection}
                                        data={thanhPhanThamDus}
                                        childKey="children"
                                        titleKey="tenThanhPhan"
                                        field="chuTri"
                                    />
                                </View>

                                {/* Chuẩn bị */}
                                <View className="mb-2">
                                    <TextInput
                                        label="Chuẩn bị"
                                        mode="outlined"
                                        value={editedEvent.chuanBi}
                                        onChangeText={(text) => setEditedEvent({ ...editedEvent, chuanBi: text })}
                                        readOnly={editedEvent.trangThai === "dangKy"}
                                    />
                                </View>

                                {/* Thành phần */}
                                <View className="mb-2">
                                    <Text className="text-base font-semibold">Thành phần *</Text>
                                    <View className="flex flex-row justify-between items-center">
                                        <View className="w-7/12">
                                            <TextInput
                                                mode="outlined"
                                                value={editedEvent.thanhPhan}
                                                // onFocus={() => setThanhPhanSelectModalVisible(true)}
                                                onFocus={() => handleOpenSelect('thanhPhan')}
                                                readOnly={editedEvent.trangThai === "dangKy"}
                                                label="Thành phần"
                                            />
                                        </View>
                                        <View className="w-4/12">
                                            <TextInput
                                                label="Ghi chú thành phần tham dự, phối hợp"
                                                mode="outlined"
                                                value={editedEvent.ghiChuThanhPhan}
                                                onChangeText={(text) => setEditedEvent({ ...editedEvent, ghiChuThanhPhan: text })}
                                                multiline
                                                textAlignVertical="top"
                                                readOnly={editedEvent.trangThai === "dangKy"}
                                            />
                                        </View>

                                    </View>

                                    <TreeSelectModal
                                        visible={thanhPhanSelectModalVisible}
                                        onClose={() => setThanhPhanSelectModalVisible(false)}
                                        onSelect={handleSelection}
                                        data={thanhPhanThamDus}
                                        childKey="children"
                                        titleKey="tenThanhPhan"
                                        field="thanhPhan"
                                    />

                                </View>

                                {/* Mời */}
                                <View className="mb-5">
                                    <TextInput
                                        label="Mời"
                                        mode="outlined"
                                        value={editedEvent.moi}
                                        onChangeText={(text) => setEditedEvent({ ...editedEvent, moi: text })}
                                        readOnly={editedEvent.trangThai === "dangKy"}
                                    />
                                </View>

                                {/* Địa điểm */}
                                <View className="flex flex-row justify-center items-center mb-2">
                                    <View className="border rounded-md w-full relative">
                                        <Text className="absolute left-3 -top-3 bg-white text-sm px-1">Địa điểm *</Text>
                                        <Dropdown
                                            data={diaDiemHops}
                                            labelField="label"
                                            valueField="value"
                                            placeholder="Địa điểm"
                                            searchPlaceholder="Tìm kiếm"
                                            value={editedEvent.diaDiem} // Giá trị hiện tại
                                            onChange={item => setEditedEvent({ ...editedEvent, diaDiem: item.value })} // Cập nhật giá trị
                                            search={true}
                                            style={{ padding: 10 }}
                                            disable={editedEvent.trangThai === "dangKy"}
                                        />
                                    </View>
                                </View>

                                {/* Ghi chú */}
                                <View className="mb-2">
                                    <TextInput
                                        label="Ghi chú"
                                        mode="outlined"
                                        value={editedEvent.ghiChu}
                                        onChangeText={(text) => setEditedEvent({ ...editedEvent, ghiChu: text })}
                                        readOnly={editedEvent.trangThai === "dangKy"}
                                    />
                                </View>

                                {/* Ngày và giờ bắt đầu */}
                                <View className="mb-2">
                                    {/* Nếu platform là ios thì hiện datetime picker */}
                                    {Platform.OS === 'ios' ? (
                                        <View className="flex flex-row justify-start items-center">
                                            <Text className="text-base font-semibold w-1/4">Ngày giờ bắt đầu *</Text>
                                            <DateTimePicker
                                                value={editedEvent.ngayBatDau ? new Date(editedEvent.ngayBatDau) : new Date().toISOString().split('T')[0]}
                                                mode="date"
                                                display="default"
                                                onChange={(event, date) => handleDatePickerChange('ngayBatDau', event, date)}
                                                locale="vi-VN"
                                                disabled={editedEvent.trangThai === "dangKy"}
                                            />
                                            <DateTimePicker
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
                                        <View className="flex flex-row justify-start items-center">
                                            <Text className="text-base font-semibold w-1/4">Ngày giờ kết thúc *</Text>
                                            <DateTimePicker
                                                value={editedEvent.ngayKetThuc ? new Date(editedEvent.ngayKetThuc) : new Date().toISOString().split('T')[0]}
                                                mode="date"
                                                display="default"
                                                onChange={(event, date) => handleDatePickerChange('ngayKetThuc', event, date)}
                                                locale="vi-VN"
                                                disabled={editedEvent.trangThai === "dangKy"}
                                            />
                                            <DateTimePicker
                                                value={editedEvent.gioKetThuc ? new Date(`2000-01-01T${editedEvent.gioKetThuc}:00`) : new Date().toTimeString().split(' ')[0].substring(0, 5)}
                                                mode="time"
                                                display="default"
                                                onChange={(event, date) => handleDatePickerChange('gioKetThuc', event, date)}
                                                locale="vi-VN"
                                                disabled={editedEvent.trangThai === "dangKy"}
                                            />
                                        </View>

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
                                {/* Tệp đính kèm */}
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
                                    {selectedEvent && (selectedEvent.trangThai === "duyet" || selectedEvent.trangThai === "dangKy" || selectedEvent.trangThai === "quanTrong") && (
                                        <Button onPress={handleCancleEvent} mode="text" textColor="red">
                                            Huỷ
                                        </Button>
                                    )}
                                    {selectedEvent && (selectedEvent.trangThai === "huy" || selectedEvent.trangThai === "dangKy" || selectedEvent.trangThai === "quanTrong") && (
                                        <Button onPress={handleAcceptEvent} mode="text">
                                            Duyệt
                                        </Button>
                                    )}
                                    {selectedEvent && selectedEvent.trangThai === "dangKy" ?
                                        <></>
                                        :
                                        <Button onPress={handleSave}>
                                            Lưu
                                        </Button>
                                    }
                                    {selectedEvent && (
                                        <Button onPress={handleDeleteEvent} mode="text" textColor="red">
                                            Xóa
                                        </Button>
                                    )}
                                </ScrollView>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default LichHopModal;
