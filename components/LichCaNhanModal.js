import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, ScrollView, Pressable, Alert, Platform } from "react-native";
import { Checkbox, Button } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/axiosInstance";
import { lichCaNhanRoute, uploadFileRoute } from "../api/baseURL";
import unidecode from 'unidecode';

const LichCaNhanModal = ({ visible, selectedEvent, onClose, onCancle, onSave, onDelete, onAccept, user }) => {
    const [editedEvent, setEditedEvent] = useState({
        loaiSuKien: "Sự kiện công việc",
        chuDe: "",
        diaDiem: "Ngoài cơ quan",
        noiDung: "",
        ngayBatDau: new Date().toISOString().split('T')[0],
        gioBatDau: new Date().toTimeString().split(' ')[0].substring(0, 5),
        ngayKetThuc: new Date().toISOString().split('T')[0],
        gioKetThuc: new Date().toTimeString().split(' ')[0].substring(0, 5),
        accountId: user?.id,
        fileDinhKem: "",
        trangThai: "duyet",
    });
    const [attachedFiles, setAttachedFiles] = useState([]);

    // Hàm mở DateTimePicker
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState("date"); // 'date' hoặc 'time'
    const [pickerField, setPickerField] = useState("");

    useEffect(() => {
        // Cập nhật editedEvent khi selectedEvent thay đổi
        if (selectedEvent) {
            setEditedEvent({
                loaiSuKien: selectedEvent.loaiSuKien || "Sự kiện công việc",
                chuDe: selectedEvent.chuDe || "",
                diaDiem: selectedEvent.diaDiem || "Ngoài cơ quan",
                noiDung: selectedEvent.noiDung || "",
                ngayBatDau: selectedEvent.ngayBatDau || "",
                gioBatDau: selectedEvent.gioBatDau || "",
                ngayKetThuc: selectedEvent.ngayKetThuc || "",
                gioKetThuc: selectedEvent.gioKetThuc || "",
                accountId: user?.id,
                fileDinhKem: selectedEvent.fileDinhKem || "",
                trangThai: selectedEvent.trangThai || "duyet",
            });
        }
    }, [selectedEvent, user?.id]);

    // Lưu sự kiện
    const handleSave = async () => {
        // console.log(editedEvent)
        if (!editedEvent.noiDung || !editedEvent.loaiSuKien || !editedEvent.chuDe || !editedEvent.diaDiem || !editedEvent.ngayBatDau || !editedEvent.gioBatDau || !editedEvent.ngayKetThuc || !editedEvent.gioKetThuc) {
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
                hancleCloseModal();
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
                hancleCloseModal();
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
                hancleCloseModal();
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
                hancleCloseModal();
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
            setEditedEvent(prevState => {
                const updatedEvent = {
                    ...prevState,
                    [field]: formattedValue,
                };

                // Đóng picker sau khi trạng thái được cập nhật
                //setShowPicker(false);

                return updatedEvent;
            });
        } else {
            setEditedEvent(prevState => {
                const updatedEvent = {
                    ...prevState,
                    [pickerField]: formattedValue,
                };

                // Đóng picker sau khi trạng thái được cập nhật
                setShowPicker(false);

                return updatedEvent;
            });
        }
    };

    const openPicker = (mode, field) => {
        setPickerMode(mode);
        setPickerField(field);
        setShowPicker(true);
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

    const hancleCloseModal = () => {
        setEditedEvent({
            loaiSuKien: "Sự kiện công việc",
            chuDe: "",
            diaDiem: "Ngoài cơ quan",
            noiDung: "",
            ngayBatDau: "",
            gioBatDau: "",
            ngayKetThuc: "",
            gioKetThuc: "",
            accountId: user?.id,
            fileDinhKem: "",
            trangThai: "duyet",
        });
        setAttachedFiles([]);
        onClose();
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View className="bg-white w-11/12 rounded-lg p-4">
                    <ScrollView>
                        <Text className="text-xl font-bold text-center mb-4">{selectedEvent ? "Sửa sự kiện" : "Thêm sự kiện"}</Text>

                        {/* Quan trọng */}
                        <View className="flex-row items-center mb-4">
                            <Checkbox
                                status={editedEvent.trangThai === "quanTrong" ? "checked" : "unchecked"}
                                onPress={() => setEditedEvent({
                                    ...editedEvent,
                                    trangThai: editedEvent.trangThai === "quanTrong" ? "duyet" : "quanTrong"
                                })}
                            />
                            <Text className="ml-2 text-base">Quan trọng</Text>
                        </View>

                        {/* Loại sự kiện */}
                        <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Loại sự kiện *</Text>
                            <View className="border rounded-md">
                                <Picker

                                    selectedValue={editedEvent.loaiSuKien}
                                    onValueChange={(value) => setEditedEvent({ ...editedEvent, loaiSuKien: value })}
                                >
                                    <Picker.Item label="Sự kiện công việc" value="Sự kiện công việc" />
                                    <Picker.Item label="Vắng mặt" value="Vắng mặt" />
                                    <Picker.Item label="Riêng tư" value="Riêng tư" />
                                </Picker>
                            </View>

                        </View>
                        {/* Chủ đề */}
                        <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Chủ đề *</Text>
                            <TextInput
                                className="border rounded-md p-2"
                                placeholder="Chủ đề *"
                                value={editedEvent.chuDe}
                                onChangeText={(text) => setEditedEvent({ ...editedEvent, chuDe: text })}
                            />
                        </View>


                        {/* Địa điểm */}
                        <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Địa điểm *</Text>
                            <View className="border rounded-md">
                                <Picker
                                    selectedValue={editedEvent.diaDiem}
                                    onValueChange={(value) => setEditedEvent({ ...editedEvent, diaDiem: value })}
                                >
                                    <Picker.Item label="Ngoài cơ quan" value="Ngoài cơ quan" />
                                    <Picker.Item label="Hội trường VTT" value="Hội trường VTT" />
                                    <Picker.Item label="Phòng họp VTT" value="Phòng họp VTT" />
                                </Picker>
                            </View>
                        </View>
                        {/* Nội dung */}
                        <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Nội dung *</Text>
                            <TextInput
                                className="border rounded-md p-2 h-24 text-start"
                                placeholder="Nội dung *"
                                multiline
                                value={editedEvent.noiDung}
                                onChangeText={(text) => setEditedEvent({ ...editedEvent, noiDung: text })}
                            />
                        </View>


                        {/* Ngày và giờ bắt đầu */}
                        <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Ngày bắt đầu * </Text>
                            {/* Nếu platform là ios thì hiện datetime picker */}
                            {Platform.OS === 'ios' ? (
                                <DateTimePicker
                                    value={editedEvent.ngayBatDau ? new Date(editedEvent.ngayBatDau) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => handleDatePickerChange('ngayBatDau', event, date)}
                                />
                            ) : (
                                <Pressable onPress={() => openPicker('date', 'ngayBatDau')}>
                                    <TextInput
                                        className="border rounded-md p-2"
                                        placeholder="Ngày bắt đầu *"
                                        value={editedEvent.ngayBatDau}
                                        editable={false}
                                    />
                                </Pressable>
                            )}
                        </View>

                        <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Giờ bắt đầu * </Text>
                            {/* Nếu platform là ios thì hiện datetime picker */}
                            {Platform.OS === 'ios' ? (
                                <DateTimePicker
                                    value={editedEvent.gioBatDau ? new Date(`2000-01-01T${editedEvent.gioBatDau}:00`) : new Date()}
                                    mode="time"
                                    display="default"
                                    onChange={(event, date) => handleDatePickerChange('gioBatDau', event, date)}
                                />
                            ) : (
                                <Pressable onPress={() => openPicker("time", "gioBatDau")}>
                                    <TextInput
                                        className="border rounded-md p-2"
                                        placeholder="Giờ bắt đầu *"
                                        value={editedEvent.gioBatDau}
                                        editable={false}
                                    />
                                </Pressable>
                            )}
                        </View>
                        {/* Ngày và giờ kết thúc */}
                        <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Ngày kết thúc * </Text>
                            {/* Nếu platform là ios thì hiện datetime picker */}
                            {Platform.OS === 'ios' ? (
                                <DateTimePicker
                                    value={editedEvent.ngayKetThuc ? new Date(editedEvent.ngayKetThuc) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => handleDatePickerChange('ngayKetThuc', event, date)}
                                />
                            ) : (
                                <Pressable onPress={() => openPicker('date', 'ngayKetThuc')}>
                                    <TextInput
                                        className="border rounded-md p-2"
                                        placeholder="Ngày kết thúc *"
                                        value={editedEvent.ngayKetThuc}
                                        editable={false}
                                    />
                                </Pressable>
                            )}
                        </View>

                        <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Giờ kết thúc * </Text>
                            {/* Nếu platform là ios thì hiện datetime picker */}
                            {Platform.OS === 'ios' ? (
                                <DateTimePicker
                                    value={editedEvent.gioKetThuc ? new Date(`2000-01-01T${editedEvent.gioKetThuc}:00`) : new Date()}
                                    mode="time"
                                    display="default"
                                    onChange={(event, date) => handleDatePickerChange('gioKetThuc', event, date)}
                                />
                            ) : (
                                <Pressable onPress={() => openPicker("time", "gioKetThuc")}>
                                    <TextInput
                                        className="border rounded-md p-2"
                                        placeholder="Giờ kết thúc *"
                                        value={editedEvent.gioKetThuc}
                                        editable={false}
                                    />
                                </Pressable>
                            )}
                        </View>

                        <View className="mb-4">
                            <Text className="text-base font-semibold mb-2">Tệp đính kèm</Text>
                            <Pressable onPress={handleFileChange}>
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
                                value={new Date()}
                                mode={pickerMode}
                                display="default"
                                onChange={(event, date) => handleDatePickerChange(null, event, date)}
                            />
                        )}

                        {/* Buttons */}
                        <View className="flex-row items-end justify-between mt-4">
                            <Button onPress={hancleCloseModal} mode="text" textColor="black">
                                Đóng
                            </Button>
                            {selectedEvent && (selectedEvent.trangThai === "duyet" || selectedEvent.trangThai === "quanTrong") && (
                                <Button onPress={handleCancleEvent} mode="text" textColor="red">
                                    Huỷ
                                </Button>
                            )}
                            {selectedEvent && (selectedEvent.trangThai === "huy" || selectedEvent.trangThai === "quanTrong") && (
                                <Button onPress={handleAcceptEvent} mode="text">
                                    Duyệt
                                </Button>
                            )}
                            <Button onPress={handleSave}>
                                Lưu
                            </Button>
                            {selectedEvent && (
                                <Button onPress={handleDeleteEvent} mode="text" textColor="red">
                                    Xóa
                                </Button>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default LichCaNhanModal;
