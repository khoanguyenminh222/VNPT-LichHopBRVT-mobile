import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { accountRoute, authRoute, phanQuyenRoute, thongKeDangNhapSaiRoute } from '../api/baseURL';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const LoginScreen = ({ navigation }) => {
    const { user, updateUser, isLogin, logoutSystem } = useAuth();
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginInfoRetrieved, setLoginInfoRetrieved] = useState(false);

    // Khi màn hình đăng nhập được tải, kiểm tra xem có thông tin đăng nhập đã được lưu trong AsyncStorage hay không
    useEffect(() => {
        const retrieveLoginInfo = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                const storedPassword = await AsyncStorage.getItem('password');
                if (storedUsername && storedPassword) {
                    setUsername(storedUsername);
                    setPassword(storedPassword);
                    setLoginInfoRetrieved(true);
                }
            } catch (error) {
                console.error('Lỗi khi lấy thông tin đăng nhập từ AsyncStorage:', error);
            }
        };

        retrieveLoginInfo();
    }, []);

    useEffect(() => {
        if (loginInfoRetrieved) {
          handleLogin();
        }
    }, [loginInfoRetrieved]);

    const handleLogin = async () => {
        setLoading(true);
        try {
            // Gửi yêu cầu đăng nhập đến API
            console.log(authRoute.login)
            const response = await axios.post(authRoute.login, { username, password });
            // Nếu đăng nhập không thành công
            if (response.status < 200 || response.status >= 300) {
                Toast.show({
                    type: 'error',
                    text1: response.data.message,
                    text2: 'Vui lòng kiểm tra thông tin đăng nhập của bạn.',
                    position: 'top',
                    visibilityTime: 3000,
                });
                return;
            }

            //Nếu đang nhập thành công thì cập nhật thongKeDangNhapSai
            const responseThongKeDangNhapSai = await axios.get(thongKeDangNhapSaiRoute.findByUserName + "/" + username);
            if (responseThongKeDangNhapSai.data) {
                await axios.put(thongKeDangNhapSaiRoute.update+"/"+responseThongKeDangNhapSai.data.id,{soLanDangNhapSai:0});
            }

            const { accessToken, refreshToken, user } = response.data;
            // Lưu thông tin username, password để tự động đăng nhập
            await AsyncStorage.setItem('username', username);
            await AsyncStorage.setItem('password', password);

            // Lưu token vào AsyncStorage
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);

            if (user.vaiTro !== 'admin') {
                //kiểm tra trạng thái tài khoản
                if (user.trangThai == 0)
                    return Toast.show({
                        type: 'error',
                        text1: 'Tài khoản đã ngưng hoạt động',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                try {
                    const response1 = await axios.get(phanQuyenRoute.getChucNangByAccountId, {
                        params: {
                            accountId: user.id
                        }
                    });
                    const urls = response1.data;

                    if (urls.length > 0) {
                        //router.push('/admin' + urls[0].url);
                        // Cập nhật thông tin người dùng trong context
                        const allowedUrls = urls.map(item => item.url)
                        updateUser(user, allowedUrls);
                        // Thông báo đăng nhập thành công
                        Toast.show({
                            type: 'success',
                            text1: response.data.message,
                            position: 'top',
                            visibilityTime: 3000,
                        });
                        // Điều hướng đến màn hình chính
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'TabNavigator' }], // Tên màn hình bạn muốn đặt làm màn hình chính
                        });
                    } else {
                        // thông báo khi chưa được cấu hình chức năng
                        Toast.show({
                            type: 'error',
                            text1: 'Tài khoản chưa được cấu hình truy cập chức năng',
                            position: 'top',
                            visibilityTime: 3000,
                        });
                    }
                } catch (error) {
                    //router.push('/login');
                    const errorMessage = error.response1 ? error.response1.data.message : error.message;
                    console.log(errorMessage);
                }
            } else {
                updateUser(user, []);
                // Thông báo đăng nhập thành công
                Toast.show({
                    type: 'success',
                    text1: response.data.message,
                    position: 'top',
                    visibilityTime: 3000,
                });
                // Điều hướng đến màn hình chính
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'TabNavigator' }], // Tên màn hình bạn muốn đặt làm màn hình chính
                });
            }

        } catch (error) {
            if(error.status === 401) {
                const responseDangNhapSai = await axios.get(thongKeDangNhapSaiRoute.findByUserName + "/" + username);
                if (responseDangNhapSai.data) { //Nếu có username trong bảng thongKeDangNhapSai thì tăng số lần đang nhập sai lên 1
                    let thongKeDangNhapSai = responseDangNhapSai.data;
                    console.log(thongKeDangNhapSai)
                    if (thongKeDangNhapSai.soLanDangNhapSai == 5) { // Sai quá 5 lần khoá tài khoản 
                        const accountResponse = await axios.get(accountRoute.findByUsername + "/" + username);
                        await axios.put(accountRoute.update + "/" + accountResponse.data.id, { trangThai: 0 });
                    }
                    if (thongKeDangNhapSai.soLanDangNhapSai <= 5) {
                        thongKeDangNhapSai.soLanDangNhapSai += 1;
                        await axios.put(thongKeDangNhapSaiRoute.update + "/" + thongKeDangNhapSai.id, thongKeDangNhapSai);
                    }

                    if (thongKeDangNhapSai.soLanDangNhapSai == 4) {
                        Toast.show({
                            type: 'error',
                            text1: 'Đăng nhập sai 2 lần nữa sẽ khoá tài khoản!',
                            position: 'top',
                            visibilityTime: 3000,
                        });
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: error.response?.data?.message ? error.response.data.message : error.message,
                            position: 'top',
                            visibilityTime: 3000,
                        });
                    }
                } else { // Nếu chưa có trong bảng thongKeDangNhapSai thì tạo mới
                    await axios.post(thongKeDangNhapSaiRoute.create, { username: username, soLanDangNhapSai: 1 });
                }
            } else {
                console.log(error)
                Toast.show({
                    type: 'error',
                    text1: error.response?.data?.message ? error.response.data.message : error.message,
                    position: 'top',
                    visibilityTime: 3000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoginCAS = async () => {
        try {
            const casLoginUrl = process.env.casURL+'?service=' + encodeURIComponent(Linking.createURL('/'));
            
            // Open the CAS login page in the browser
            const result = await WebBrowser.openAuthSessionAsync(casLoginUrl, Linking.createURL('/'));
            console.log("result",result)
            if (result.type === 'success') {
                const redirectUrl = result.url;
    
                // Parse the ticket or token from the CAS redirect URL
                const params = new URLSearchParams(redirectUrl.split('?')[1]);
                const ticket = params.get('ticket');
    
                if (ticket) {
                    // Use the ticket to authenticate with your backend server
                    await authenticateWithBackend(ticket);
                } else {
                    console.log('Ticket not found');
                }
            }
        } catch (error) {
            console.error('CAS login failed', error);
        }
    }

    const authenticateWithBackend = async (ticket) => {
        console.log(ticket)
        //const response = await axios.post(authRoute.casbrvtlogin, { ticket });
    
        if (response.ok) {
            // Successful login
            console.log('Logged in successfully');
        } else {
            console.log('Failed to authenticate');
        }
    };

    return (
        <View className="flex-1 justify-center p-4">
            <Text variant='headlineMedium' className="font-bold text-center mb-6">Đăng nhập</Text>
            <TextInput
                label="Tên đăng nhập"
                value={username}
                onChangeText={setUsername}
                mode="outlined"

            />
            <TextInput
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
            />
            <Button mode="contained" onPress={handleLogin} className="mt-4" disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : 'Đăng nhập'}
            </Button>
            <Button mode="text" onPress={handleLoginCAS} className="mt-4">
                Đăng nhập bằng CAS
            </Button>
        </View>
    );
};

export default LoginScreen;
