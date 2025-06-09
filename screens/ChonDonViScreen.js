import React, { useEffect, useState } from 'react';
import { View, Image, ImageBackground, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { accountRoute, donViRoute } from '../api/baseURL';
import { setCurrentDatabase } from '../utils/databaseConfig';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';

const ChonDonViScreen = ({ navigation }) => {
    const [donVi, setDonVi] = useState("");
    const [donViList, setDonViList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        }
    }, []);

    useEffect(() => {
        const fetchDonViOptions = async () => {
            try {
                const response = await axios.get(donViRoute.findAll);
                if (response.status >= 200 && response.status < 300) {
                    console.log(response.data);
                    const data = response.data.filter(item => item.id > 1); // Loại bỏ đơn vị "All" (id = 1)
                    setDonViList(data);
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Không thể tải danh sách đơn vị!',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách đơn vị:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Có lỗi khi tải danh sách đơn vị!',
                    position: 'top',
                    visibilityTime: 3000,
                });
            }
        };
        fetchDonViOptions();
    }, []);

    const handleSubmit = async () => {
        if (!donVi) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn đơn vị!',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }
        setIsLoading(true);
        try {
            // Lấy ra id của đơn vị đã chọn
            const selectedDonVi = donViList.find(item => item.maDonVi === donVi);
            if (!selectedDonVi) {
                Toast.show({
                    type: 'error',
                    text1: 'Đơn vị không hợp lệ!',
                    position: 'top',
                    visibilityTime: 3000,
                });
                setIsLoading(false);
                return;
            }

            if (!user) {
                Toast.show({
                    type: 'error',
                    text1: 'Không tìm thấy thông tin người dùng!',
                    position: 'top',
                    visibilityTime: 3000,
                });
                setIsLoading(false);
                return;
            }

            // Gửi lên API để cập nhật account với donViId
            try {
                const res = await axios.put(accountRoute.update + "/" + user.id, { donViId: selectedDonVi.id });
                await setCurrentDatabase(selectedDonVi.maDonVi); // Lưu đơn vị đã chọn vào AsyncStorage
                Toast.show({
                    type: 'success',
                    text1: 'Chọn đơn vị thành công!',
                    position: 'top',
                    visibilityTime: 3000,
                });
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'TabNavigator' }],
                });
            } catch (error) {
                console.error("Lỗi khi cập nhật đơn vị:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Có lỗi khi cập nhật đơn vị!',
                    position: 'top',
                    visibilityTime: 3000,
                });
            }
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Có lỗi khi chọn đơn vị!',
                position: 'top',
                visibilityTime: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Lấy phiên bản từ Constants.manifest.version
    const appVersion = Constants.expoConfig?.version || 'Unknown';

    return (
        <ImageBackground 
            source={require('../assets/bgVNPT.jpg')} 
            resizeMode="cover" 
            style={{ flex: 1 }}
        >
            <ScrollView 
                contentContainerStyle={{ 
                    flexGrow: 1, 
                    justifyContent: 'center',
                    padding: 20
                }}
            >
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Image 
                        source={require('../assets/logoHeader.png')} 
                        style={{ width: 140, height: 140 }}
                    />
                </View>
                
                <View style={{ 
                    backgroundColor: 'white', 
                    padding: 20, 
                    borderRadius: 10,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}>
                    <Text style={{ 
                        fontSize: 24, 
                        fontWeight: 'bold', 
                        color: '#2563eb',
                        textAlign: 'center',
                        marginBottom: 10
                    }}>
                        Chọn đơn vị
                    </Text>
                    
                    <Text style={{ 
                        color: '#4b5563',
                        textAlign: 'center',
                        marginBottom: 20
                    }}>
                        Lưu ý chỉ chọn 1 lần duy nhất.
                    </Text>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ 
                            color: '#374151',
                            fontWeight: 'bold',
                            marginBottom: 8
                        }}>
                            Đơn vị:
                        </Text>
                        <View style={{ 
                            borderWidth: 1,
                            borderColor: '#d1d5db',
                            borderRadius: 4,
                            backgroundColor: 'white'
                        }}>
                            <Picker
                                selectedValue={donVi}
                                onValueChange={(itemValue) => setDonVi(itemValue)}
                                style={{ height: 50 }}
                            >
                                <Picker.Item label="-- Chọn đơn vị --" value="" />
                                {donViList.map(opt => (
                                    <Picker.Item 
                                        key={opt.id} 
                                        label={opt.maDonVi} 
                                        value={opt.maDonVi} 
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        disabled={isLoading}
                        style={{
                            backgroundColor: '#2563eb',
                            paddingVertical: 8
                        }}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            'Xác nhận'
                        )}
                    </Button>
                </View>
            </ScrollView>
            <View className={`${Platform.OS == 'ios' ? 'bottom-20' : 'bottom-0'} right-0 left-0 flex justify-center items-center`}>
                <Text className="text-center" style={{ color: 'rgb(107 114 128)' }}>Phiên bản: {appVersion}</Text>
                <Text className="text-center">Bản quyền thuộc về Viễn Thông Bà Rịa Vũng Tàu</Text>
            </View>
        </ImageBackground>
    );
};

export default ChonDonViScreen; 