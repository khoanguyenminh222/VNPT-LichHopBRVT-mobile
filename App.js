// App.js
import './gesture-handler';
import './global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
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
import ThongTinScreen from './screens/root/ThongTinScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const BaoCaoStack = createStackNavigator();
const DonViStack = createStackNavigator();

const TabNavigator = () => {
    const { colors } = useTheme();
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Lịch họp"
                component={LichHopScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <IconButton icon="home" iconColor={focused ? colors.primary : colors.disabled} size={24} />
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

const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='Login'>
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
                <PaperProvider theme={CustomLightTheme}>
                    <NavigationContainer ref={navigationRef}>
                        <AppNavigator />
                        <StatusBar style="dark" />
                        <Toast />
                    </NavigationContainer>
                </PaperProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
