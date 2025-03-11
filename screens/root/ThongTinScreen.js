import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, Modal } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import TreeSelectWithDatetimeModal from '../../components/TreeSelectWithDatetimeModal';
import { accountDuyetLichRoute, thanhPhanThamDuRoute } from '../../api/baseURL';
import axiosInstance from '../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useFontSize } from '../../context/FontSizeContext';

const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
};

// Component Modal xác nhận xóa
const DeleteConfirmationModal = ({ visible, onClose, onDelete, id }) => {
    const { fontSize } = useFontSize();

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`${accountDuyetLichRoute.delete}/${id}`);
            onDelete(id); // Cập nhật danh sách sau khi xóa
            Toast.show({
                type: 'success',
                text1: 'Xóa thành công',
                position: 'top',
                visibilityTime: 3000,
            });
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : error.message;
            Toast.show({
                type: 'error',
                text1: 'Xóa thất bại',
                text2: errorMessage,
                position: 'top',
                visibilityTime: 3000,
            });
        } finally {
            onClose(); // Đóng Modal sau khi xử lý
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose} // Đóng Modal khi nhấn nút Back (Android)
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-3/4 p-5 bg-white rounded-lg items-center z-10">
                    <Text style={{ fontSize: fontSize * 1.2 }} className="font-bold text-gray-800 mb-3">Xác nhận</Text>
                    <Text style={{ fontSize }} className="text-gray-600 text-center mb-5">Bạn có chắc chắn muốn xóa ủy quyền này?</Text>
                    <View className="flex-row justify-between w-full">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 py-2 px-4 bg-gray-400 rounded-md mr-2 items-center"
                        >
                            <Text style={{ fontSize }} className="text-white">Hủy</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleDelete}
                            className="flex-1 py-2 px-4 bg-red-500 rounded-md items-center"
                        >
                            <Text style={{ fontSize }} className="text-white">Xóa</Text>

                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const ThongTinScreen = () => {
    const { fontSize } = useFontSize();
    const { logoutSystem, user } = useAuth();
    const [selectModalVisible, setSelectModalVisible] = useState(false);
    const [thanhPhanThamDus, setThanhPhanThamDus] = useState([]);
    const [uyQuyens, setUyQuyens] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Lấy phiên bản từ Constants.manifest.version
    const appVersion = Constants.expoConfig?.version || 'Unknown';

    const handleLogout = async () => {
        logoutSystem();
        Toast.show({
            type: 'success',
            text1: 'Đăng xuất thành công',
            position: 'top',
            visibilityTime: 3000,
        });
    }

    // Gọi api lấy ra thành phần tham dự
    const fetchThanhPhanThamDu = async () => {
        try {
            const response = await axiosInstance.get(thanhPhanThamDuRoute.findAll);
            if (response.status >= 200 && response.status < 300) {
                setThanhPhanThamDus(response.data.filter(item => item.idCotCha === null && item.id < 300));
                console.log(response.data.filter(item => item.idCotCha === null && item.id < 300));
            }
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : error.message;
            console.log(errorMessage);
        }
    };

    // Gọi api lấy ra danh sách uỷ quyền
    const fetchUyQuyen = async () => {
        try {
            // Lấy tất cả các bản ghi từ accountDuyetLich
            const response = await axiosInstance.get(accountDuyetLichRoute.findAll);
            if (response.status >= 200 && response.status < 300) {
                const responseThanhPhan = await axiosInstance.get(thanhPhanThamDuRoute.findAll);
                const thanhPhanThamDuData = responseThanhPhan.data;

                // Sử dụng Promise.all để chờ tất cả các lời gọi API hoàn tất
                const result = await Promise.all(
                    response.data.map(async (item) => {
                        const thanhPhanThamDu = thanhPhanThamDuData.find(tp => tp.username === item.username);

                        return {
                            ...item,
                            tenThanhPhan: thanhPhanThamDu?.tenThanhPhan || ""
                        };
                    })
                );
                setUyQuyens(result);
            }
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : error.message;
            console.log(errorMessage);
        }
    };

    const fetchData = async () => {
        if (user.username !== 'test') {
            await fetchThanhPhanThamDu();
            await fetchUyQuyen();
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelection = async (selectedItems, field, thoiGianBatDau, thoiGianKetThuc) => {
        try {
            const responseAccountDuyetLich = await axiosInstance.get(accountDuyetLichRoute.findAll);
            const existingUsernames = responseAccountDuyetLich.data.map(item => item.username); // Lấy danh sách username từ dữ liệu trả về

            // Kiểm tra xem username có trong đó chưa, nếu có thì cập nhật ngày, chưa thì tạo mới
            for (let username of selectedItems) {
                // Kiểm tra xem username đã tồn tại chưa
                if (existingUsernames.includes(username)) {
                    // Nếu username đã có, cập nhật ngày
                    let accountDuyetLich = {
                        username,
                        ngayBatDau: thoiGianBatDau,
                        ngayKetThuc: thoiGianKetThuc,
                    }
                    await axiosInstance.put(accountDuyetLichRoute.update + "/" + username, accountDuyetLich);
                    console.log(`Cập nhật ngày cho username: ${username}`);
                } else {
                    // Nếu username chưa có, tạo mới
                    await axiosInstance.post(accountDuyetLichRoute.create, {
                        username,
                        ngayBatDau: thoiGianBatDau,
                        ngayKetThuc: thoiGianKetThuc,
                    });
                    console.log(`Tạo mới username: ${username}`);
                }
            }
            Toast.show({
                type: 'success',
                text1: 'Uỷ quyền thành công',
                position: 'top',
                visibilityTime: 3000,
            });
            fetchUyQuyen();
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : error.message;
            console.log(errorMessage);
            Toast.show({
                type: 'error',
                text1: 'Uỷ quyền thất bại',
                text2: errorMessage,
                position: 'top',
                visibilityTime: 3000,
            });
        }
    };

    const handleDeletePress = (id) => {
        setSelectedId(id);
        setDeleteModalVisible(true);
    };

    const handleDeleteSuccess = (id) => {
        setUyQuyens(uyQuyens.filter((item) => item.id !== id));
    };

    const handleDelete = async (id) => {
        // Confirm xóa
        Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa ủy quyền này?', [
            {
                text: 'Hủy',
                style: 'cancel',
            },
            {
                text: 'Xóa',
                onPress: async () => {
                    try {
                        // Gửi yêu cầu xóa đến API
                        await axiosInstance.delete(`${accountDuyetLichRoute.delete}/${id}`);

                        // Cập nhật danh sách sau khi xóa
                        setUyQuyens(uyQuyens.filter((item) => item.id !== id));
                        Toast.show({
                            type: 'success',
                            text1: 'Xóa thành công',
                            position: 'top',
                            visibilityTime: 3000,
                        });
                    } catch (error) {
                        const errorMessage = error.response ? error.response.data.message : error.message;
                        console.log(errorMessage);
                        Toast.show({
                            type: 'error',
                            text1: 'Xóa thất bại',
                            text2: errorMessage,
                            position: 'top',
                            visibilityTime: 3000,
                        });
                    }
                },
            },
        ]);
    };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                        fetchData();
                    }}
                />
            }
        >
            <View className="flex-1 justify-center items-center bg-gray-100 py-6">
                <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center mb-4">
                    <Text style={{ fontSize: fontSize * 1.5 }} className="font-semibold text-blue-600 text-center">{user?.name}</Text>
                    <Text style={{ fontSize }} className="text-gray-500 text-center">{user?.username}</Text>
                </View>

                {uyQuyens.find(item => item.username === user?.username) && (
                    <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center mb-4">
                        <Text style={{ fontSize: fontSize * 1.5 }} className="font-semibold text-blue-600 text-center">Bạn đang được uỷ quyền duyệt lịch</Text>
                        <Text style={{ fontSize }} className="text-gray-500 text-center">Hãy thực hiện trên ứng dụng di động</Text>
                        <Text style={{ fontSize }} className="text-gray-500 text-center">
                            Từ {formatDate(uyQuyens.find(item => item.username === user?.username).ngayBatDau)} đến {formatDate(uyQuyens.find(item => item.username === user?.username).ngayKetThuc)}
                        </Text>
                    </View>
                )}

                {user?.vaiTro === 'admin' && (
                    <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center mb-4">
                        <Text style={{ fontSize: fontSize * 1.5 }} className="font-semibold text-blue-600 text-center">Uỷ quyền duyệt lịch</Text>
                        <Pressable onPress={() => setSelectModalVisible(true)} className="w-32 py-3 px-6 bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 mt-4 m-auto justify-center items-center">
                            <Text style={{ fontSize }} className="text-white font-semibold">Chọn</Text>
                        </Pressable>

                        <TreeSelectWithDatetimeModal
                            visible={selectModalVisible}
                            onClose={() => setSelectModalVisible(false)}
                            onSelect={handleSelection}
                            data={thanhPhanThamDus}
                            childKey="children"
                            titleKey="tenThanhPhan"
                            field="chuTri"
                        />

                        <View className="mt-4">
                            <Text style={{ fontSize: fontSize * 1.2 }} className="font-bold text-blue-700">Danh sách ủy quyền</Text>
                            <View className="flex flex-col items-center mt-3 space-y-4">
                                {uyQuyens.map((item, index) => (
                                    <View
                                        key={index}
                                        className="flex flex-row justify-between items-center max-w-md bg-gray-50 p-4 shadow-md"
                                    >
                                        <View className="flex-1 pr-2">
                                            <Text style={{ fontSize: fontSize * 1.1 }} className="font-semibold text-gray-800">{item.tenThanhPhan || "Chưa có tên"}</Text>
                                            <Text style={{ fontSize: fontSize * 0.9 }} className="text-gray-600">{item.username}</Text>
                                        </View>
                                        <View className="flex flex-row items-center">
                                            <Text style={{ fontSize: fontSize * 0.9 }} className="text-gray-500">
                                                {formatDate(item.ngayBatDau)} - {formatDate(item.ngayKetThuc)}
                                            </Text>
                                            <Pressable className="ml-2" onPress={() => handleDeletePress(item.id)}>
                                                <Text><FontAwesomeIcon icon={faTrash} color='#ef4444' /></Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center mb-4">
                    <Text style={{ fontSize: fontSize * 1.5 }} className="font-semibold text-blue-600 text-center">Ứng dụng tra cứu lịch họp VNPT</Text>
                    <Text style={{ fontSize }} className="text-gray-500 mt-10 text-center">Được phát triển bởi Trung tâm Công nghệ Thông tin - Viễn thông Bà Rịa - Vũng Tàu</Text>
                    <Text style={{ fontSize }} className="text-gray-500 mt-16 text-center">Phiên bản: {appVersion}</Text>
                </View>

                <Pressable onPress={handleLogout} className="py-3 px-6 bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 mt-4 justify-end items-end">
                    <Text style={{ fontSize }} className="text-white font-semibold">Đăng xuất</Text>
                </Pressable>
                {/* Modal xác nhận xóa */}
                <DeleteConfirmationModal
                    visible={deleteModalVisible}
                    onClose={() => setDeleteModalVisible(false)}
                    onDelete={handleDeleteSuccess}
                    id={selectedId}
                />
            </View>
            
        </ScrollView>
    );
};

export default ThongTinScreen;
