import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert, Image, Platform, ImageBackground, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { accountRoute, authRoute, domain, phanQuyenRoute, thongKeDangNhapSaiRoute, tokenRoute } from '../api/baseURL';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Buffer } from 'buffer';
import * as Linking from 'expo-linking';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const LoginScreen = ({ navigation }) => {
    const { user, updateUser, isLogin, logoutSystem } = useAuth();
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginInfoRetrieved, setLoginInfoRetrieved] = useState(false);
    const [loginWithCAS, setLoginWithCAS] = useState(false);
    const [showWebView, setShowWebView] = useState(false);
    const [casLoginUrl, setCasLoginUrl] = useState('');
    const [hidePass, setHidePass] = useState(true);
    // Khi màn hình đăng nhập được tải, kiểm tra xem có thông tin đăng nhập đã được lưu trong AsyncStorage hay không
    useEffect(() => {
        const retrieveLoginInfo = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                const storedPassword = await AsyncStorage.getItem('password');
                // Nếu có thông tin đăng nhập, thực hiện đăng nhập tự động
                if (storedPassword === 'loginWithCas') { // Nếu đăng nhập bằng CAS
                    setUsername(storedUsername);
                    setPassword(storedPassword);
                    setLoginWithCAS(true);
                } else if (storedUsername && storedPassword !== 'loginWithCas') {
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
        if (username === 'test' && password === '123456') {
            updateUser({ id: 0, username: 'test' }, []);
            // Thông báo đăng nhập thành công
            Toast.show({
                type: 'success',
                text1: 'Đăng nhập thành công với tài khoản admin',
                position: 'top',
                visibilityTime: 3000,
            });
            // Điều hướng đến màn hình chính
            navigation.reset({
                index: 0,
                routes: [{ name: 'TabNavigator' }],
            });
        } else if (username === 'test' && password !== '123456') {
            Toast.show({
                type: 'error',
                text1: 'Sai thông tin đăng nhập',
                position: 'top',
                visibilityTime: 3000,
            });
            setLoading(false);
            return;
        }
        if (username !== 'test') {
            try {
                // Gửi yêu cầu đăng nhập đến API
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
                    await axios.put(thongKeDangNhapSaiRoute.update + "/" + responseThongKeDangNhapSai.data.id, { soLanDangNhapSai: 0 });
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
                if (error.status === 401) {
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
        }

    };

    // Tự động đăng nhập bằng CAS nếu chưa đăng xuất
    useEffect(() => {
        if (username && password === 'loginWithCas') {
            callAPILoginCAS(username);
        }
    }, [loginWithCAS]);

    // Hàm gọi API đăng nhập CAS
    const callAPILoginCAS = async (username) => {
        setLoading(true);
        try {
            // Gọi API Node.js để thực hiện đăng nhập cas
            const response = await axios.post(authRoute.casbrvtlogin, { username: username });
            if (response.status >= 200 && response.status < 300) {
                // Thiết lập cookie từ kết quả trả về
                const { accessToken, refreshToken, user, expiresIn } = response.data;

                await axios.post(tokenRoute.saveToken, { accountId: user.id, refreshToken, expiresIn });

                // Kiểm tra người dùng được gán nhóm chức năng chưa
                const responsePhanQuyen = await axios.get(phanQuyenRoute.getNhomChucNangByAccountId, {
                    params: {
                        accountId: user.id
                    }
                });
                if (responsePhanQuyen.status >= 200 && responsePhanQuyen.status < 300) {
                    if (responsePhanQuyen.data.length === 0) {
                        // gán nhóm chức năng cho user
                        const responseAccount = await axios.get(accountRoute.findByUsername + "/" + username);
                        if (responseAccount.status >= 200 && responseAccount.status < 300) {

                            if (responseAccount.data.vaiTro === 'chuyenVien') {
                                await axios.post(phanQuyenRoute.savePhanQuyenForAccount, {
                                    accountId: responseAccount.data.id,
                                    nhomChucNangIds: [2]
                                });
                            } else if (responseAccount.data.vaiTro === 'lanhDao') {
                                await axios.post(phanQuyenRoute.savePhanQuyenForAccount, {
                                    accountId: responseAccount.data.id,
                                    nhomChucNangIds: [3]
                                });
                            }
                        }
                    }
                }
                // Lưu thông tin username, password để tự động đăng nhập
                await AsyncStorage.setItem('username', username);
                await AsyncStorage.setItem('password', 'loginWithCas');

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

            } else {
                return Toast.show({
                    type: 'error',
                    text1: 'Lỗi đăng nhập CAS',
                    position: 'top',
                    visibilityTime: 3000,
                });
            }
        } catch (error) {
            console.log(error)
            Toast.show({
                type: 'error',
                text1: error.response?.data?.message ? error.response.data.message : error.message,
                position: 'top',
                visibilityTime: 3000,
            });
        } finally {
            setLoading(false);
            setShowWebView(false);
        }
    };

    // Khi nhấn nút đăng nhập CAS
    const handleLoginCAS = async () => {
        try {
            const redirectUri = AuthSession.makeRedirectUri({ useProxy: false });
            console.log('Redirect URI:', redirectUri);

            const casURL = process.env.casURL; // URL CAS
            const serviceUrl = process.env.serviceUrl; // Backend xử lý

            // Tạo URL đăng nhập CAS
            const generatedCasLoginUrl = `${casURL}?service=${encodeURIComponent(serviceUrl)}`;
            setCasLoginUrl(generatedCasLoginUrl); // Cập nhật URL vào state

            if (Platform.OS === 'android') {
                setShowWebView(true);
            } else {
                // Dành cho iOS, sử dụng WebBrowser mở trang web ngoài
                const result = await WebBrowser.openAuthSessionAsync(generatedCasLoginUrl, redirectUri);

                if (result.type === 'success' && result.url) {
                    //console.log('WebBrowser result:', result);
                    const parsedUrl = Linking.parse(result.url);
                    const { queryParams } = parsedUrl;

                    if (!queryParams) return;

                    const username = queryParams?.username;
                    if (username) {
                        const encodeUsername = Buffer.from(username, 'base64').toString('utf-8');

                        callAPILoginCAS(encodeUsername);
                    } else {
                        console.log('Không tìm thấy username trong callback URL');
                        Toast.show({
                            type: 'error',
                            text1: 'Không tìm thấy username trong callback URL',
                            position: 'top',
                            visibilityTime: 3000,
                        });
                    }
                } else {
                    console.log('Người dùng hủy đăng nhập hoặc không có URL callback');
                }
            }
        } catch (error) {
            console.error('Lỗi đăng nhập CAS:', error);
        }
    };

    // Lấy phiên bản từ Constants.manifest.version
    const appVersion = Constants.expoConfig?.version || 'Unknown';

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {showWebView ? (
                <View style={{ flex: 1, marginTop: Platform.OS === 'android' ? 25 : 0 }}>
                    <Button mode="text" onPress={() => setShowWebView(false)} style={{ alignSelf: 'center', width: '100%', padding: 8 }}>
                        Quay lại trang đăng nhập
                    </Button>
                    <WebView
                        source={{ uri: casLoginUrl }} // Sử dụng casLoginUrl từ state
                        style={{ flex: 1 }}
                        onNavigationStateChange={(navState) => {
                            if (navState.url.includes('vnptlichhop://')) {
                                // Xử lý redirect về app qua deep link (vnptlichhop://)
                                const parsedUrl = Linking.parse(navState.url);
                                const { queryParams } = parsedUrl;

                                if (!queryParams) return;

                                const username = queryParams?.username;
                                if (username) {
                                    const encodeUsername = Buffer.from(username, 'base64').toString('utf-8');

                                    callAPILoginCAS(encodeUsername);
                                } else {
                                    console.log('Không tìm thấy username trong callback URL');
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Không tìm thấy username trong callback URL',
                                        position: 'top',
                                        visibilityTime: 3000,
                                    });
                                }
                            }
                        }}
                    />

                </View>
            ) : (
                <ImageBackground source={require('../assets/bgVNPT.jpg')} resizeMode="cover" className="h-full w-full">
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ marginVertical: 'auto', paddingHorizontal: 12 }}>
                        <Image source={require('../assets/logoHeader.png')} style={{ width: 140, height: 140, alignSelf: 'center', }} />
                        <View className="flex flex-col justify-center items-center">
                            <Text className="my-6 text-3xl" style={{ color: 'rgb(75 85 99)' }}>VNPT Lịch Họp</Text>
                            <TextInput
                                label="Tên đăng nhập"
                                value={username}
                                onChangeText={setUsername}
                                mode="outlined"
                                style={{ marginBottom: 10, width: '100%', maxWidth: 460 }}
                            />
                            <TextInput
                                label="Mật khẩu"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={hidePass}
                                mode="outlined"
                                style={{ marginBottom: 10, width: '100%', maxWidth: 460 }}
                                right={
                                    <TextInput.Icon
                                        color="black"
                                        onPress={() => setHidePass(!hidePass)}
                                        icon={() => (
                                            <FontAwesomeIcon icon={hidePass ? faEye : faEyeSlash} size={20} color="gray" />
                                        )}
                                    />
                                }
                            />
                            <Button mode="contained" onPress={handleLogin} disabled={loading} style={{ marginTop: 10, width: '100%', maxWidth: 460 }}>
                                {loading ? <ActivityIndicator color="#fff" /> : 'Đăng nhập'}
                            </Button>
                            <Button mode="text" onPress={handleLoginCAS} style={{ marginBottom: 10, width: '100%', maxWidth: 460 }}>
                                Đăng nhập bằng Mail Tập đoàn
                            </Button>
                        </View>

                    </ScrollView>
                    <View className={`${Platform.OS == 'ios' ? 'bottom-20' : 'bottom-0'} right-0 left-0 flex justify-center items-center`}>
                        <Text className="text-center" style={{ color: 'rgb(107 114 128)' }}>Phiên bản: {appVersion}</Text>
                        <Text className="text-center">Bản quyền thuộc về Viễn Thông Bà Rịa Vũng Tàu</Text>
                    </View>
                </ImageBackground>
            )}
        </View>
    );
};

export default LoginScreen;
