// App.js
import 'expo-dev-client';
import './gesture-handler';
import './global.css';
import React, { useLayoutEffect, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native-paper';
import { Provider as PaperProvider, IconButton, useTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomLightTheme } from './constants/themes';
import Toast from 'react-native-toast-message';
import Sidebar from './components/Sidebar';
import LoginScreen from './screens/LoginScreen';
import NotFoundScreen from './screens/NotFoundScreen';
import { navigationRef } from './utils/NavigationService';
import LichHopScreen from './screens/root/LichHopScreen';
import LichCaNhanScreen from './screens/root/LichCaNhanScreen';
import ThongTinScreen from './screens/root/ThongTinScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import hasAccess from './utils/permissionsAllowedURL';
import { screenUrls } from './api/routes';
import SettingScreen from './screens/root/SettingScreen';
import { FontSizeProvider } from './context/FontSizeContext';
import { HighlightTextProvider } from './context/HighlightTextContext';
import axios from 'axios';
import { accountRoute } from './api/baseURL';
import { Platform, Pressable, Text } from 'react-native';
import { FakeIOSProvider } from './context/FakeIOSContext';
import LichHopFakeScreen from './screens/fakeScreen/LichHopFakeScreen';
import ThongTinFakeScreen from './screens/fakeScreen/ThongTinFakeScreen';
import ComplaintFakeScreen from './screens/fakeScreen/ComplaintFakeScreen';
import { useViewModeStore } from './stores/StoreViewMode';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDay, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const BaoCaoStack = createStackNavigator();
const DonViStack = createStackNavigator();

const TabNavigator = ({ navigation }) => {
    const { colors } = useTheme();
    const { user, userAllowedUrls, logoutSystem } = useAuth();
    const { viewMode, setViewMode } = useViewModeStore(state => state);
    console.log('viewMode', viewMode);
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
                        headerRight: () => (
                            <Button onPress={() => alert('This is a button!')}>Info</Button>
                        )
                        // headerRight: () => (
                    }}
                />
            }
            <Tab.Screen
                name="Cài đặt"
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
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await axios.get(`${accountRoute.findByUsername}/appstore`);
                if (response.status >= 200 && response.status < 300) {
                    if (response.data.trangThai === 0) { // Trạng thái appstore không hoạt động thì không có có màn hình login
                        setIsLogin(false);
                    }
                }
            } catch (error) {
                console.error("Error fetching login status:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStatus();
    }, []);
    if (isLoading) {
        return null;
    }
    const initialRoute = Platform.OS === "ios" && !isLogin ? "fakescreen" : "Login";
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            {Platform.OS === "ios" && (
                <Stack.Screen name="fakescreen" component={TabHackingAppleNavigator} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} />
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
        </Stack.Navigator>
    );
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
                                <Toast />
                            </NavigationContainer>
                        </PaperProvider>
                    </HighlightTextProvider>
                </FontSizeProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
