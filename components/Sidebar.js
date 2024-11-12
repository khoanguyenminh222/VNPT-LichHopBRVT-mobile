import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import hasAccess from '../utils/permissionsAllowedURL';
import { screenUrls } from '../api/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Sidebar = (props) => {
    const { logoutSystem, isLogin, user, userAllowedUrls } = useAuth();
    const [activeScreen, setActiveScreen] = useState('Dashboard');
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const handleMenuClick = (screen) => {
        setActiveScreen(screen);
        if (screen === 'BaoCao') {
            navigation.navigate('BaoCaoStack', { screen: 'BaoCao' });
        } else if (screen === 'DonViConTrucThuoc') {
            navigation.navigate('DonViConTrucThuocStack', { screen: 'DonViConTrucThuoc' });
        } else if (screen === 'BanDo') {
            navigation.navigate('BanDo');
        } else if (screen === 'ThongKe') {
            navigation.navigate('ThongKe');
        } else if (screen === 'Dashboard') {
            navigation.navigate('Dashboard');
        }
    };

    const handleLogout = async () => {
        setIsLoading(true);
        await AsyncStorage.clear();
        logoutSystem();
        Toast.show({
            type: 'success',
            text1: 'Đăng xuất thành công',
            position: 'top',
            visibilityTime: 3000,
        });
    };

    return (
        <DrawerContentScrollView {...props} className="bg-white flex-1 p-5">
            {/* Logo Section */}
            <View className="items-center mb-5">
                <Image
                    source={require('../assets/logoVNPT.png')}
                    className="w-20 h-20 rounded-full mb-2"
                />
                <Text className="text-2xl font-bold text-gray-800">CSDL Ngoại Vụ</Text>
            </View>

            <View className="border-b border-gray-300 my-2" />

            {/* User Info */}
            <View className="mb-5 items-center">
                <Text className="text-xl font-bold text-gray-800">{user?.name}</Text>
                <View
                    className={`mt-2 p-3 rounded-md ${user?.vaiTro === 'admin' ? 'bg-red-500' :
                            user?.vaiTro === 'lanhDao' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                >
                    <Text className="text-white text-center">
                        {user?.vaiTro === 'admin' ? 'Quản trị hệ thống' :
                            user?.vaiTro === 'lanhDao' ? 'Lãnh đạo' : 'Chuyên viên'}
                    </Text>
                </View>
            </View>

            {/* Menu Items */}
            <View className="flex-1">
                <View className="border-b border-gray-300 my-2" />
                <Text className="text-lg font-bold mt-5 text-gray-800">Menu</Text>

                {(hasAccess(screenUrls.Dashboard, userAllowedUrls) || user?.vaiTro == 'admin') &&
                    <MenuButton
                        isActive={activeScreen === 'Dashboard'}
                        icon="chart-box-outline"
                        label="Dashboard"
                        onPress={() => handleMenuClick('Dashboard')}
                    />
                }

                {(hasAccess(screenUrls.BaoCao, userAllowedUrls) || user?.vaiTro == 'admin') &&
                    <MenuButton
                        isActive={activeScreen === 'BaoCao'}
                        icon="file-document-outline"
                        label="Báo cáo"
                        onPress={() => handleMenuClick('BaoCao')}
                    />
                }

                {(hasAccess(screenUrls.DonViConTrucThuoc, userAllowedUrls) || user?.vaiTro == 'admin') &&
                    <MenuButton
                        isActive={activeScreen === 'DonViConTrucThuoc'}
                        icon="account-multiple-outline"
                        label="Đơn vị con trực thuộc"
                        onPress={() => handleMenuClick('DonViConTrucThuoc')}
                    />
                }

                {(hasAccess(screenUrls.BanDo, userAllowedUrls) || user?.vaiTro == 'admin') &&
                    <MenuButton
                        isActive={activeScreen === 'BanDo'}
                        icon="map"
                        label="Bản đồ"
                        onPress={() => handleMenuClick('BanDo')}
                    />
                }

                {(hasAccess(screenUrls.ThongKe, userAllowedUrls) || user?.vaiTro == 'admin') &&
                    <MenuButton
                        isActive={activeScreen === 'ThongKe'}
                        icon="chart-bar"
                        label="Thống kê"
                        onPress={() => handleMenuClick('ThongKe')}
                    />
                }
            </View>

            {/* Logout Button */}
            <View className="w-full my-1">
                <Button
                    mode="contained-tonal"
                    onPress={handleLogout}
                    className="w-full mt-auto mb-5"
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color="#fff" /> : 'Đăng xuất'}
                </Button>
            </View>
        </DrawerContentScrollView>
    );
};

const MenuButton = ({ onPress, isActive, icon, label }) => {
    const [pressed, setPressed] = useState(false);

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            className={`w-full my-1 flex flex-row items-center justify-start px-4 py-2 rounded-lg ${pressed ? 'bg-blue-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
        >
            <Icon name={icon} size={20} color={isActive || pressed ? 'white' : 'black'} />
            <Text className={`ml-2 ${isActive || pressed ? 'text-white' : 'text-black'}`}>{label}</Text>
        </Pressable>
    );
};

export default Sidebar;
