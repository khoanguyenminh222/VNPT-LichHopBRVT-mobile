// App.js
import 'expo-dev-client';
import './global.css';
import React, { useLayoutEffect, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native-paper';
import { Provider as PaperProvider, IconButton, useTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomLightTheme } from './constants/themes';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import LoginScreen from './screens/LoginScreen';
import NotFoundScreen from './screens/NotFoundScreen';
import { navigationRef } from './utils/NavigationService';
import LichHopScreen from './screens/root/LichHopScreen';
import LichCaNhanScreen from './screens/root/LichCaNhanScreen';
import ThongTinScreen from './screens/root/ThongTinScreen';
import QuanLyDuAnScreen from './screens/root/QuanLyDuAnScreen';
import QuanLyCongViecScreen from './screens/root/QuanLyCongViecScreen';
import { Feather, Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from 'react-native-safe-area-context';
import hasAccess from './utils/permissionsAllowedURL';
import { screenUrls } from './api/routes';
import SettingScreen from './screens/root/SettingScreen';
import { FontSizeProvider } from './context/FontSizeContext';
import { HighlightTextProvider } from './context/HighlightTextContext';
import axios from 'axios';
import { accountRoute } from './api/baseURL';
import { Platform, Pressable, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { FakeIOSProvider } from './context/FakeIOSContext';
import LichHopFakeScreen from './screens/fakeScreen/LichHopFakeScreen';
import ThongTinFakeScreen from './screens/fakeScreen/ThongTinFakeScreen';
import ComplaintFakeScreen from './screens/fakeScreen/ComplaintFakeScreen';
import { useViewModeStore } from './stores/StoreViewMode';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDay, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import WebViewBIScreen from './screens/root/WebViewBIScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const BaoCaoStack = createStackNavigator();
const DonViStack = createStackNavigator();

const TabNavigator = ({ navigation }) => {
    const { colors } = useTheme();
    const { user, userAllowedUrls, logoutSystem } = useAuth();
    const { viewMode, setViewMode } = useViewModeStore(state => state);

    const handleChangeViewMode = () => {
        viewMode === 1 ? setViewMode(2) : setViewMode(1);
    }
    const headerRight = (
        <Pressable onPress={() => handleChangeViewMode()} className="mr-3">

            <FontAwesomeIcon
                icon={viewMode === 1 ? faCalendarWeek : faCalendarDay}
                size={20}
                style={{ marginRight: 10 }}
            />

        </Pressable>
    );

    const viewTaskButton = (
        <TouchableOpacity className="mr-4" onPress={() => navigation.navigate("TaskManagement")}>
            <Ionicons name="terminal" size={24} />
        </TouchableOpacity>
    );
    return (
        <Tab.Navigator>
            {(hasAccess(screenUrls.LichHop, userAllowedUrls) || user?.vaiTro === 'admin') && (
                <Tab.Screen
                    name="Lịch họp"
                    component={LichHopScreen}
                    options={() => ({
                        tabBarIcon: ({ focused }) => (
                            <IconButton
                                icon="calendar"
                                iconColor={focused ? colors.primary : colors.disabled}
                                size={24}
                            />
                        ),
                        headerRight: () => headerRight,
                    })}
                />
            )}
            {(hasAccess(screenUrls.LichCaNhan, userAllowedUrls) || user?.vaiTro == 'admin') &&
                <Tab.Screen
                    name="Lịch cá nhân"
                    component={LichCaNhanScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <IconButton icon="calendar-account" iconColor={focused ? colors.primary : colors.disabled} size={24} />
                        ),
                    }}
                />
            }
            {(hasAccess(screenUrls.QuanLyDuAn, userAllowedUrls) || user?.vaiTro === 'admin') &&
                <Tab.Screen
                    name="Dự án"
                    component={QuanLyDuAnScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <IconButton icon="chart-timeline-variant" iconColor={focused ? colors.primary : colors.disabled} size={24} />
                        ),
                        headerRight: () => viewTaskButton,
                    }}
                />
            }
            <Tab.Screen
                name="Điều hành"
                component={SettingScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <IconButton icon="tools" iconColor={focused ? colors.primary : colors.disabled} size={24} />
                    )
                }}
            />
            <Tab.Screen
                name="Thông tin"
                component={ThongTinScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <IconButton icon="account" iconColor={focused ? colors.primary : colors.disabled} size={24} />
                    )
                }}
            />
        </Tab.Navigator>
    );
};

const TabHackingAppleNavigator = () => {
    const { colors } = useTheme();
    return (
        <FakeIOSProvider>
            <Tab.Navigator screenOptions={{ headerShown: false }}>
                <Tab.Screen
                    name="Tin tức"
                    component={LichHopFakeScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <IconButton icon="calendar" iconColor={focused ? colors.primary : colors.disabled} size={24} />
                        )
                    }}
                />
                <Tab.Screen
                    name="Phản hồi"
                    component={ComplaintFakeScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <IconButton icon="lightbulb" iconColor={focused ? colors.primary : colors.disabled} size={24} />
                        )
                    }}
                />
                <Tab.Screen
                    name="Cài đặt"
                    component={ThongTinFakeScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <IconButton icon="wrench" iconColor={focused ? colors.primary : colors.disabled} size={24} />
                        )
                    }}
                />
            </Tab.Navigator>
        </FakeIOSProvider>
    );
};

const AppNavigator = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    // useEffect(() => {
    //     const fetchStatus = async () => {
    //         try {
    //             const response = await axios.get(`${accountRoute.findByUsername}/appstore`);
    //             if (response.status >= 200 && response.status < 300) {
    //                 if (response.data.trangThai === 0) { // Trạng thái appstore không hoạt động thì không có có màn hình login
    //                     setIsLogin(false);
    //                 }
    //             }
    //         } catch (error) {
    //             console.error("Error fetching login status:", error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
    //     fetchStatus();
    // }, []);
    // if (isLoading) {
    //     return null;
    // }
    //const initialRoute = Platform.OS === "ios" && !isLogin ? "fakescreen" : "Login";
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
            {Platform.OS === "ios" && (
                <Stack.Screen name="fakescreen" component={TabHackingAppleNavigator} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} />
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
            <Stack.Screen name="WebViewBI" component={WebViewBIScreen} />
            <Stack.Screen name="TaskManagement" component={QuanLyCongViecScreen} />
        </Stack.Navigator>
    );
};


const toastConfig = {
    success: ({ text1, text2, props, ...rest }) => (
        <View style={styles.toastContainer}>
            <View style={[styles.toastContent, styles.successBorder]}>
                <View style={styles.iconContainer}>
                    <Feather name="check-circle" size={24} color="#22c55e" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{text1}</Text>
                    {text2 ? <Text style={styles.messageText}>{text2}</Text> : null}
                </View>
            </View>
        </View>
    ),

    error: ({ text1, text2, props, ...rest }) => (
        <View style={styles.toastContainer}>
            <View style={[styles.toastContent, styles.errorBorder]}>
                <View style={styles.iconContainer}>
                    <Feather name="alert-circle" size={24} color="#ef4444" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{text1}</Text>
                    {text2 ? <Text style={styles.messageText}>{text2}</Text> : null}
                </View>
            </View>
        </View>
    ),

    info: ({ text1, text2, props, ...rest }) => (
        <View style={styles.toastContainer}>
            <View style={[styles.toastContent, styles.infoBorder]}>
                <View style={styles.iconContainer}>
                    <Feather name="info" size={24} color="#3b82f6" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{text1}</Text>
                    {text2 ? <Text style={styles.messageText}>{text2}</Text> : null}
                </View>
            </View>
        </View>
    ),

    warning: ({ text1, text2, props, ...rest }) => (
        <View style={styles.toastContainer}>
            <View style={[styles.toastContent, styles.warningBorder]}>
                <View style={styles.iconContainer}>
                    <Feather name="alert-triangle" size={24} color="#f59e0b" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{text1}</Text>
                    {text2 ? <Text style={styles.messageText}>{text2}</Text> : null}
                </View>
            </View>
        </View>
    ),
};
export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <FontSizeProvider>
                    <HighlightTextProvider>
                        <PaperProvider theme={CustomLightTheme}>
                            <NavigationContainer ref={navigationRef}>
                                <AppNavigator />
                                <StatusBar style="dark" />
                                <Toast config={toastConfig} position="top" topOffset={50} />
                            </NavigationContainer>
                        </PaperProvider>
                    </HighlightTextProvider>
                </FontSizeProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    toastContainer: {
        width: '90%',
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: '5%',
        marginVertical: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        minHeight: 64,
    },
    successBorder: {
        borderLeftWidth: 4,
        borderLeftColor: '#22c55e',
    },
    errorBorder: {
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    infoBorder: {
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    warningBorder: {
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    messageText: {
        fontSize: 14,
        color: '#6b7280',
    },
});