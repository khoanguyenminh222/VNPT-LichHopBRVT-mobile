import React, { useEffect, useRef, useState } from "react";
import { Modal, View, Text, ScrollView, Pressable, Alert, Platform, TouchableWithoutFeedback } from "react-native";
import { Checkbox, Button, TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/axiosInstance";
import { accountDuyetLichRoute, phanQuyenRoute, accountRoute, diaDiemHopRoute, eventRoute, lichCaNhanRoute, thanhPhanThamDuRoute, uploadFileRoute, sendSMSRoute, accountNhanSMSRoute, eventHistoryRoute } from "../api/baseURL";
import unidecode from 'unidecode';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Dropdown } from 'react-native-element-dropdown';
import TreeSelectModal from "./TreeSelectModal";
import sendSms from "../utils/sendSms";
import removeAccents from "remove-accents";
import hasAccess from "../utils/permissionsAllowedURL";
import { screenUrls } from "../api/routes";

const formatDateForSMS = (date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    const s = date.getSeconds().toString().padStart(2, "0");
    return `${h}:${min}:${s} ${d}/${m}/${y}`;
};

export const removeDiacritics = (str) => {
    return str.replace(/đ/g, "d")  // Thay thế 'đ' thành 'd'
        .replace(/Đ/g, "D")  // Thay thế 'Đ' thành 'D'
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
};


const LichHopModal = ({ visible, selectedEvent, onClose, onCancle, onSave, onDelete, onAccept, user, userAllowedUrls }) => {
    const [editedEvent, setEditedEvent] = useState({
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
    const [attachedFiles, setAttachedFiles] = useState([]);

    const [isGioKetThucVisible, setIsGioKetThucVisible] = useState(false);

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

    // Ref cho input chủ trì, thành phần
    const chuTriRef = useRef(null);
    const thanhPhanRef = useRef(null);

    const [errors, setErrors] = useState({});
    // Kiểm tra tài khoản có trong danh sách duyệt lịch không
    const [isAccountDuyetLich, setIsAccountDuyetLich] = useState(false);
    const [accountDuyetLich, setAccountDuyetLich] = useState([]);
    const [accountChinhSuaLich, setAccountChinhSuaLich] = useState([]);
    const [accountNhanSMS, setAccountNhanSMS] = useState([]);

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

                // Kiểm tra xem người dùng hiện tại có nằm trong danh sách hợp lệ không
                const isAccountDuyetLich = uniqueAccountDuyetLich.includes(user?.id);

                // Lưu trạng thái của người dùng
                setIsAccountDuyetLich(isAccountDuyetLich);

                //console.log('Danh sách tài khoản hợp lệ:', uniqueAccountDuyetLich);
                //console.log('Người dùng có quyền duyệt lịch:', isAccountDuyetLich);

            } catch (error) {
                console.error('Failed to fetch accounts for duyet lich:', error);
                const errorMessage = error.response ? error.response.data.message : error.message;
                //toast.error(errorMessage);
            }
        };
        const fetchAccountChinhSuaLich = async () => {
            try {
                // Gọi API để lấy danh sách accountId có URL '/lich-hop/duyet'
                const fetchChucNangForAllAccount = await axiosInstance.get(phanQuyenRoute.getChucNangForAllAccounts);
                const accountsWithSpecificUrl = fetchChucNangForAllAccount.data
                    .filter(item => item.url === '/lich-hop/edit')
                    .map(item => item.accountId); // Lấy ra accountId
                // Fetch ra các tài khoản có vaiTro là admin
                const fetchAdminAccounts = await axiosInstance.get(accountRoute.findAll);
                const adminAccounts = fetchAdminAccounts.data.filter(account => account.vaiTro === "admin").map(account => account.id);
                // fetch ra tài khoản được cấu hình nhận sms
                const fetchAccountNhanSMS = await axiosInstance.get(accountNhanSMSRoute.findAll);
                const accountNhanSMS = fetchAccountNhanSMS.data.map(account => account.accountId);
                // Gộp hai danh sách
                const accountChinhSuaLich = [...new Set([...accountsWithSpecificUrl, ...adminAccounts, ...accountNhanSMS])];
                //console.log("account chỉnh sửa lịch:", accountChinhSuaLich)
                setAccountChinhSuaLich(accountChinhSuaLich);
            } catch (error) {
                console.error('Failed to fetch accounts for duyet lich:', error);
                const errorMessage = error.response ? error.response.data.message : error.message;
                //toast.error(errorMessage);
            }
        };
        fetchAccountChinhSuaLich();
        processAccountDuyetLich();
    }, []);

    // useEffect(() => {
    //     const checkAccountDuyetLich = async () => {
    //         try {
    //             const response = await axiosInstance.get(accountDuyetLichRoute.findAll);

    //             // Lấy ngày hiện tại (chỉ lấy phần ngày)
    //             const currentDate = new Date();
    //             const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    //             // Kiểm tra user có username trong danh sách và ngày nằm giữa ngayBatDau và ngayKetThuc
    //             const isAccountDuyetLich = response.data.some(account => {
    //                 if (account.username === user?.username) {
    //                     const ngayBatDau = new Date(account.ngayBatDau);
    //                     const ngayKetThuc = new Date(account.ngayKetThuc);

    //                     // Chỉ lấy phần ngày của ngayBatDau và ngayKetThuc
    //                     const ngayBatDauOnly = new Date(ngayBatDau.getFullYear(), ngayBatDau.getMonth(), ngayBatDau.getDate());
    //                     const ngayKetThucOnly = new Date(ngayKetThuc.getFullYear(), ngayKetThuc.getMonth(), ngayKetThuc.getDate());

    //                     return currentDateOnly >= ngayBatDauOnly && currentDateOnly <= ngayKetThucOnly;
    //                 }
    //                 return false;
    //             });
    //             console.log("ádsad",isAccountDuyetLich)
    //             setIsAccountDuyetLich(isAccountDuyetLich);
    //         }
    //         catch (error) {
    //             console.log('Failed to fetch account duyet lich:', error);
    //             const errorMessage = error.response ? error.response.data.message : error.message;
    //             Toast.show({
    //                 type: 'error',
    //                 text1: errorMessage,
    //                 position: 'top',
    //                 visibilityTime: 3000,
    //             });
    //         }
    //     }
    //     checkAccountDuyetLich();
    // }, []);
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
        const fetchData = async () => {
            try {
                // fetch ra tài khoản accountNhanSMS
                const fetchAccountNhanSMS = await axiosInstance.get(accountNhanSMSRoute.findAll);
                const accountNhanSMS = fetchAccountNhanSMS.data.map(account => account.accountId);
                //console.log(accountNhanSMS)
                setAccountNhanSMS(accountNhanSMS);
            } catch (error) {
                console.error('Failed to fetch accounts for duyet lich:', error);
                const errorMessage = error.response ? error.response.data.message : error.message;
                Toast.show({
                    type: 'error',
                    text1: errorMessage,
                });
            }
        };
        fetchData();
    }, []);

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
                gioKetThuc: selectedEvent.gioKetThuc != 'Inval' && selectedEvent.gioKetThuc !=null ? selectedEvent.gioKetThuc : null,
                fileDinhKem: selectedEvent.fileDinhKem,
                trangThai: selectedEvent.trangThai,
                accountId: selectedEvent.accountId,
                quanTrong: selectedEvent.quanTrong,
            });
            setIsGioKetThucVisible(selectedEvent.gioKetThuc ? true : false);
        }
        setErrors({});
        fetchDiaDiemHops();
        fetchThanhPhanThamDu();
        fetchChuTris();
    }, [selectedEvent, user?.id]);

    // Lưu sự kiện



    const handleSave = async () => {
        const newErrors = {};
        if (!editedEvent.noiDungCuocHop) newErrors.noiDungCuocHop = "Vui lòng nhập nội dung cuộc họp.";
        if (!editedEvent.chuTri) newErrors.chuTri = "Vui lòng chọn chủ trì.";
        if (!editedEvent.thanhPhan && !editedEvent.ghiChuThanhPhan) newErrors.thanhPhan = "Vui lòng chọn hoặc nhập ghi chú thành phần.";
        if (!editedEvent.diaDiem) newErrors.diaDiem = "Vui lòng chọn địa điểm.";
        if (!editedEvent.ngayBatDau) newErrors.ngayBatDau = "Vui lòng chọn ngày bắt đầu.";
        if (!editedEvent.gioBatDau) newErrors.gioBatDau = "Vui lòng chọn giờ bắt đầu.";
        if (!editedEvent.ngayKetThuc) newErrors.ngayKetThuc = "Vui lòng chọn ngày kết thúc.";
        //if (!editedEvent.gioKetThuc) newErrors.gioKetThuc = "Vui lòng chọn giờ kết thúc.";

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
        editedEvent.trangThai == "" ? editedEvent.trangThai = "dangKy" : editedEvent.trangThai;
        try {
            let response;
            if (selectedEvent) {
                // Gọi API để cập nhật sự kiện
                response = await axiosInstance.put(`${eventRoute.update}/${selectedEvent.id}`, editedEvent);

                // Lưu vào bảng lịch sử
                let dataHistory = {
                    eventId: selectedEvent.id,
                    updatedBy: user.id,
                    updatedAt: new Date().toLocaleString("sv-SE").replace("T", " "),
                    oldValue: JSON.stringify(selectedEvent),
                    newValue: JSON.stringify(editedEvent),
                    actionType: "CHINHSUA",
                }
                await axiosInstance.post(eventHistoryRoute.create, dataHistory);

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
                // const smsText = 'Lich hop BRVT: [Trang thai: Dang ky] ' + removeAccents(editedEvent.noiDungCuocHop) + ' dien ra luc ' + new Date(`${editedEvent.ngayBatDau}T${editedEvent.gioBatDau}:00`).toLocaleString().replace('T', ' ').split('.')[0]
                // if (accountDuyetLich?.length) {
                //     await Promise.all(
                //         await sendSms({
                //             accountDuyetLich: accountDuyetLich ? accountDuyetLich : null,
                //             noiDungSms: smsText,
                //             smsType: 1,
                //             accountId: user.id,
                //             storedUser: user,
                //         })
                //     );
                // }
                if (!selectedEvent) {
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
                                content: 'Lich hop BRVT: [Trang thai: Dang ky] ' + removeDiacritics(editedEvent.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${editedEvent.ngayBatDau}T${editedEvent.gioBatDau}:00`))
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
                } else {
                    const smsPromises = accountChinhSuaLich.map(async (accountId) => {
                        if (accountId == selectedEvent.accountId) {
                            const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + selectedEvent.accountId);
                            if (selectedEvent.accountId != user.id) {
                                //console.log("gửi sms");
                                await axiosInstance.post(sendSMSRoute.sendSMS, {
                                    phonenumber: responseAccount.data.phone,
                                    content: 'Lich hop BRVT: [Trang thai: Chinh sua] ' + removeDiacritics(editedEvent.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${editedEvent.ngayBatDau}T${editedEvent.gioBatDau}:00`))
                                });
                                return;
                            }
                            return;
                        }
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
                            if (accountId != user.id) {
                                await axiosInstance.post(sendSMSRoute.sendSMS, {
                                    phonenumber: account.phone,
                                    content: 'Lich hop BRVT: [Trang thai: Chinh Sua] ' + removeDiacritics(editedEvent.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${editedEvent.ngayBatDau}T${editedEvent.gioBatDau}:00`))
                                });
                            }
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
                }

            } else {
                Toast.show({
                    type: 'error',
                    text1: response.data.message,
                });
            }
        } catch (error) {
            console.log("1", error);
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
                const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + selectedEvent.accountId);
                const accountExisted = responseAccount.data.id
                if (selectedEvent.accountId != user.id) {
                    //console.log("gửi sms");
                    if (responseAccount.data.phone) {
                        await axiosInstance.post(sendSMSRoute.sendSMS, {
                            phonenumber: responseAccount.data.phone,
                            content: 'Lich hop BRVT: [Trang thai: Xoa] ' + removeDiacritics(selectedEvent.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${selectedEvent.ngayBatDau}T${selectedEvent.gioBatDau}:00`))
                        });
                    }
                }
                const smsPromises = accountNhanSMS.map(async (accountId) => {
                    // Lấy thông tin tài khoản từ API theo accountId
                    const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + accountId);
                    const account = responseAccount.data;

                    // Kiểm tra nếu tài khoản đã tồn tại trong danh sách tài khoản đã gửi SMS
                    if (accountExisted == accountId) {
                        return;
                    }
                    // Nếu account.phone null thì bỏ qua
                    if (!account.phone) {
                        return;
                    }
                    //console.log(removeAccents(data.noiDungCuocHop))
                    // Gửi SMS cho tài khoản này
                    try {
                        await axiosInstance.post(sendSMSRoute.sendSMS, {
                            phonenumber: account.phone,
                            content: 'Lich hop BRVT: [Trang thai: Xoa] ' + removeDiacritics(selectedEvent.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${selectedEvent.ngayBatDau}T${selectedEvent.gioBatDau}:00`))
                        });
                    } catch (error) {
                        // Nếu có lỗi trong quá trình gửi SMS
                        Toast.show({
                            type: 'error',
                            text1: 'Gửi SMS thất bại cho ' + account.phone,
                        });
                    }
                });
                await Promise.all(smsPromises);
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
            // Tải trước danh sách tài khoản và lịch cá nhân
            const [responseAccounts, responseLichCaNhan] = await Promise.all([
                axiosInstance.get(accountRoute.findAll),
                axiosInstance.get(lichCaNhanRoute.findAll),
            ]);

            // Tạo Map từ danh sách tài khoản để truy cập nhanh chóng
            const accountsMap = new Map(
                responseAccounts.data.map(account => [account.id, account])
            );

            // Danh sách lịch cá nhân
            const lichCaNhan = responseLichCaNhan.data;

            // Kiểm tra và cập nhật trạng thái cho các sự kiện trùng lặp
            for (const item of lichCaNhan) {
                const account = accountsMap.get(item.accountId);

                if (
                    account &&
                    item.accountId == account.id &&
                    item.chuDe == editedEvent.noiDungCuocHop &&
                    item.trangThai == "dangKy" &&
                    item.ngayBatDau == editedEvent.ngayBatDau &&
                    item.gioBatDau == editedEvent.gioBatDau &&
                    item.ngayKetThuc == editedEvent.ngayKetThuc
                    //item.gioKetThuc == new Date(editedEvent.gioKetThuc).toTimeString().slice(0, 5)
                ) {
                    // Cập nhật trạng thái sự kiện thành "đã duyệt"
                    await axiosInstance.put(`${lichCaNhanRoute.update}/${item.id}`, { trangThai: "duyet" });
                }
            }

            const response = await axiosInstance.put(eventRoute.update + "/" + selectedEvent.id, { trangThai: "duyet" });
            if (response.status >= 200 && response.status < 300) {

                let data = {
                    ...selectedEvent,
                    trangThai: "duyet",
                }
                // Lưu vào bảng lịch sử
                let dataHistory = {
                    eventId: selectedEvent.id,
                    updatedBy: user.id,
                    updatedAt: new Date().toLocaleString("sv-SE").replace("T", " "),
                    oldValue: JSON.stringify(selectedEvent),
                    newValue: JSON.stringify(data),
                    actionType: "DUYET",
                }
                await axiosInstance.post(eventHistoryRoute.create, dataHistory);

                Toast.show({
                    type: 'success',
                    text1: response.data.message,
                });
                // Gửi SMS
                const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + selectedEvent.accountId);
                const accountExisted = responseAccount.data.id;
                if (selectedEvent.accountId != user.id) {
                    //console.log("gửi sms");
                    if (responseAccount.data.phone) {
                        await axiosInstance.post(sendSMSRoute.sendSMS, {
                            phonenumber: responseAccount.data.phone,
                            content: 'Lich hop BRVT: [Trang thai: Duyet] ' + removeDiacritics(selectedEvent.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${selectedEvent.ngayBatDau}T${selectedEvent.gioBatDau}:00`))
                        });
                    }

                }
                const smsPromises = accountNhanSMS.map(async (accountId) => {
                    // Lấy thông tin tài khoản từ API theo accountId
                    const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + accountId);
                    const account = responseAccount.data;

                    // Kiểm tra nếu tài khoản đã tồn tại trong danh sách tài khoản đã gửi SMS
                    if (accountExisted == accountId) {
                        return;
                    }
                    // Nếu account.phone null thì bỏ qua
                    if (!account.phone) {
                        return;
                    }
                    //console.log(removeAccents(data.noiDungCuocHop))
                    // Gửi SMS cho tài khoản này
                    try {
                        await axiosInstance.post(sendSMSRoute.sendSMS, {
                            phonenumber: account.phone,
                            content: 'Lich hop BRVT: [Trang thai: Duyet] ' + removeDiacritics(selectedEvent.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${selectedEvent.ngayBatDau}T${selectedEvent.gioBatDau}:00`))
                        });
                    } catch (error) {
                        // Nếu có lỗi trong quá trình gửi SMS
                        Toast.show({
                            type: 'error',
                            text1: 'Gửi SMS thất bại cho ' + account.phone,
                        });
                    }
                });
                await Promise.all(smsPromises);
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
                        item.ngayKetThuc == editedEvent.ngayKetThuc
                        //item.gioKetThuc == editedEvent.gioKetThuc
                    ) {
                        // Cập nhật trạng thái sự kiện thành đã duyệt
                        await axiosInstance.put(lichCaNhanRoute.update + "/" + item.id, { trangThai: "duyet" });
                        return;
                    }
                });
            }

            const response = await axiosInstance.put(eventRoute.update + "/" + selectedEvent.id, { trangThai: "huy" });
            if (response.status >= 200 && response.status < 300) {

                let data = {
                    ...selectedEvent,
                    trangThai: "huy",
                }
                // Lưu vào bảng lịch sử
                let dataHistory = {
                    eventId: selectedEvent.id,
                    updatedBy: user.id,
                    updatedAt: new Date().toLocaleString("sv-SE").replace("T", " "),
                    oldValue: JSON.stringify(selectedEvent),
                    newValue: JSON.stringify(data),
                    actionType: "HUY",
                }
                await axiosInstance.post(eventHistoryRoute.create, dataHistory);

                Toast.show({
                    type: 'success',
                    text1: response.data.message,
                });
                const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + selectedEvent.accountId);
                const accountExisted = responseAccount.data.id;
                if (selectedEvent.accountId != user.id) {
                    //console.log("gửi sms");
                    if (responseAccount.data.phone) {
                        await axiosInstance.post(sendSMSRoute.sendSMS, {
                            phonenumber: responseAccount.data.phone,
                            content: 'Lich hop BRVT: [Trang thai: Huy] ' + removeDiacritics(selectedEvent.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${selectedEvent.ngayBatDau}T${selectedEvent.gioBatDau}:00`))
                        });
                    }
                }
                const smsPromises = accountNhanSMS.map(async (accountId) => {
                    // Lấy thông tin tài khoản từ API theo accountId
                    const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + accountId);
                    const account = responseAccount.data;

                    // Kiểm tra nếu tài khoản đã tồn tại trong danh sách tài khoản đã gửi SMS
                    if (accountExisted == accountId) {
                        return;
                    }
                    // Nếu account.phone null thì bỏ qua
                    if (!account.phone) {
                        return;
                    }
                    //console.log(removeAccents(data.noiDungCuocHop))
                    // Gửi SMS cho tài khoản này
                    try {
                        await axiosInstance.post(sendSMSRoute.sendSMS, {
                            phonenumber: account.phone,
                            content: 'Lich hop BRVT: [Trang thai: Huy] ' + removeDiacritics(selectedEvent.noiDungCuocHop) + ' dien ra luc ' + formatDateForSMS(new Date(`${selectedEvent.ngayBatDau}T${selectedEvent.gioBatDau}:00`))
                        });
                    } catch (error) {
                        // Nếu có lỗi trong quá trình gửi SMS
                        Toast.show({
                            type: 'error',
                            text1: 'Gửi SMS thất bại cho ' + account.phone,
                        });
                    }
                });
                await Promise.all(smsPromises);
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
        console.log("test")
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
        // Kiểm tra nếu value không hợp lệ, đặt mặc định là ngày hiện tại
        let parsedValue = value && !value.includes("null") ? new Date(value) : new Date();
        setPickerMode(mode);
        setPickerField(field);
        setShowPicker(true);
        setValueDateTime(parsedValue);
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
        setErrors({});
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

        if (chuTriRef.current) {
            chuTriRef.current.blur(); // Đảm bảo blur sau khi chọn
        }

        if (thanhPhanRef.current) {
            thanhPhanRef.current.blur(); // Đảm bảo blur sau khi chọn
        }
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
        if (chuTriRef.current) {
            chuTriRef.current.blur(); // Đảm bảo TextInput mất focus
        }
        if (thanhPhanRef.current) {
            thanhPhanRef.current.blur(); // Đảm bảo TextInput mất focus
        }
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
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>

                <View className="bg-white w-96 rounded-lg p-4 my-8">
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <Text className="text-xl font-bold text-center mb-4 fixed top-0">{selectedEvent ? "Sửa lịch" : "Thêm lịch"}</Text>

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

                        {/* Nội dung cuộc họp */}
                        <View className="mb-2">
                            <TextInput
                                label="Nội dung cuộc họp *"
                                mode="outlined"
                                value={editedEvent.noiDungCuocHop}
                                onChangeText={(text) => setEditedEvent({ ...editedEvent, noiDungCuocHop: text })}
                                readOnly={editedEvent.trangThai === "dangKy"}
                                error={errors.noiDungCuocHop}
                            />
                        </View>
                        {/* Chủ trì */}
                        <View className="mb-2">
                            <TextInput
                                //ref={chuTriRef}
                                value={editedEvent.chuTri}
                                onChangeText={(text) => setEditedEvent({ ...editedEvent, chuTri: text })}
                                multiline
                                //onFocus={() => handleOpenSelect('chuTri')}
                                readOnly={editedEvent.trangThai === "dangKy"}
                                label="Chủ trì *"
                                mode="outlined"
                                error={errors.chuTri}
                            />

                            {/* <TreeSelectModal
                                visible={chuTriSelectModalVisible}
                                onClose={() => { setChuTriSelectModalVisible(false), chuTriRef.current.blur() }}
                                onSelect={handleSelection}
                                data={thanhPhanThamDus}
                                childKey="children"
                                titleKey="tenThanhPhan"
                                field="chuTri"
                            /> */}
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
                            <TextInput
                                ref={thanhPhanRef}
                                mode="outlined"
                                value={editedEvent.thanhPhan}
                                // onFocus={() => setThanhPhanSelectModalVisible(true)}
                                onFocus={() => handleOpenSelect('thanhPhan')}
                                readOnly={editedEvent.trangThai === "dangKy"}
                                label="Thành phần"
                                error={errors.thanhPhan || errors.ghiChuThanhPhan}
                            />
                            <TextInput
                                label="Ghi chú thành phần tham dự, phối hợp"
                                mode="outlined"
                                multiline
                                value={editedEvent.ghiChuThanhPhan}
                                onChangeText={(text) => setEditedEvent({ ...editedEvent, ghiChuThanhPhan: text })}
                                textAlignVertical="top"
                                readOnly={editedEvent.trangThai === "dangKy"}
                                style={{ marginTop: 5 }}
                            />

                            <TreeSelectModal
                                visible={thanhPhanSelectModalVisible}
                                onClose={() => { setThanhPhanSelectModalVisible(false), thanhPhanRef.current.blur() }}
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
                                <Text className="absolute left-3 -top-3 bg-white text-sm px-1">Địa điểm, phương tiện *</Text>
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
                                {errors.diaDiem && <Text className="text-red-500 text-sm ml-2">{errors.diaDiem}</Text>}
                            </View>
                        </View>

                        {/* Ghi chú */}
                        <View className="mb-2">
                            <TextInput
                                label="Ghi chú"
                                mode="outlined"
                                multiline
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
                                        is24Hour={true}
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
                                    <Pressable className="w-4/12" onPress={() => openPicker("time", "gioBatDau", `2000-01-01T${editedEvent.gioBatDau}`,)} disabled={editedEvent.trangThai === "dangKy"}>
                                        <TextInput
                                            label="Giờ bắt đầu *"
                                            is24Hour={false}
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

                            {selectedEvent && (isAccountDuyetLich || user?.vaiTro == 'admin') && (selectedEvent.trangThai === "duyet" || selectedEvent.trangThai === "dangKy" || selectedEvent.trangThai === "quanTrong") && (
                                <Button onPress={handleCancleEvent} mode="text" textColor="red">
                                    Huỷ
                                </Button>
                            )}
                            {selectedEvent && (isAccountDuyetLich || user?.vaiTro == 'admin') && (selectedEvent.trangThai === "huy" || selectedEvent.trangThai === "dangKy" || selectedEvent.trangThai === "quanTrong") && (
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
            </View>
        </Modal>
    );
};

export default LichHopModal;
