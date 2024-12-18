import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import TreeSelectWithDatetimeModal from '../../components/TreeSelectWithDatetimeModal';
import { accountDuyetLichRoute, thanhPhanThamDuRoute } from '../../api/baseURL';
import axiosInstance from '../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
};

const ThongTinScreen = () => {
    const { logoutSystem, user } = useAuth();
    const [selectModalVisible, setSelectModalVisible] = useState(false);
    const [thanhPhanThamDus, setThanhPhanThamDus] = useState([]);
    const [uyQuyens, setUyQuyens] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

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
                setThanhPhanThamDus(response.data.filter(item => item.idCotCha === null));
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
        if(user.username !== 'test') {
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
                    <Text className="text-2xl font-semibold text-blue-600 text-center">Xin chào</Text>
                    <Text className="text-lg text-gray-500 text-center">{user?.username}</Text>
                </View>
                {/* Kiểm tra trong phần uỷ quyền có username thì hiện ra, hiện ra cả ngày */}
                {uyQuyens.find(item => item.username === user?.username) && (
                    <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center mb-4">
                        <Text className="text-2xl font-semibold text-blue-600 text-center">Bạn đang được uỷ quyền duyệt lịch</Text>
                        <Text className="text-lg text-gray-500 text-center">Hãy thực hiện trên ứng dụng di động</Text>
                        <Text className="text-lg text-gray-500 text-center">Từ {formatDate(uyQuyens.find(item => item.username === user?.username).ngayBatDau)} đến {formatDate(uyQuyens.find(item => item.username === user?.username).ngayKetThuc)}</Text>
                    </View>
                )}
                {/*Chức năng uỷ quyền cho user duyệt */}
                {user?.vaiTro === 'admin' &&

                    <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center mb-4">
                        <Text className="text-2xl font-semibold text-blue-600 text-center">Uỷ quyền duyệt lịch</Text>
                        <Pressable onPress={() => setSelectModalVisible(true)} className="w-32 py-3 px-6 bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 mt-4 m-auto justify-center items-center">
                            <Text className="text-white text-lg font-semibold">Chọn</Text>
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
                            <Text className="text-xl font-bold text-blue-700">Danh sách ủy quyền</Text>
                            <View className="flex flex-col items-center mt-3 space-y-4">
                                {uyQuyens.map((item, index) => (
                                    <View
                                        key={index}
                                        className="flex flex-row justify-between items-center max-w-md bg-gray-50 p-4 shadow-md"
                                    >
                                        {/* Cột thông tin chính */}
                                        <View className="flex-1 pr-2">
                                            <Text className="text-lg font-semibold text-gray-800">{item.tenThanhPhan || "Chưa có tên"}</Text>
                                            <Text className="text-sm text-gray-600">{item.username}</Text>
                                        </View>
                                        {/* Ngày tháng và nút xóa */}
                                        <View className="flex flex-row items-center">
                                            <Text className="text-sm text-gray-500">
                                                {formatDate(item.ngayBatDau)} - {formatDate(item.ngayKetThuc)}
                                            </Text>
                                            <Pressable className="ml-2" onPress={() => handleDelete(item.id)}>
                                                <Text><FontAwesomeIcon icon={faTrash} color='#ef4444' /></Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>


                    </View>
                }
                {/* App information */}
                <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center mb-4">
                    <Text className="text-2xl font-semibold text-blue-600 text-center">Ứng dụng tra cứu lịch họp VNPT</Text>
                    <Text className="text-lg text-gray-500 mt-10 text-center">Được phát triển bởi Trung tâm Công nghệ Thông tin - Viễn thông Bà Rịa - Vũng Tàu</Text>
                    <Text className="text-gray-500 mt-16 text-center">Phiên bản: {appVersion}</Text>
                </View>

                {/* Logout button */}
                <Pressable onPress={handleLogout} className="py-3 px-6 bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 mt-4 justify-end items-end">
                    <Text className="text-white text-lg font-semibold">Đăng xuất</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
};

export default ThongTinScreen;
