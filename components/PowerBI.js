import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { linkBIRoute } from '../api/baseURL';
import { Icon } from 'react-native-paper';

const PowerBI = ({ navigation, fontSize }) => {
    const [linkBIs, setLinkBIs] = useState([]);
    const [filteredLinks, setFilteredLinks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(linkBIRoute.findAll);
                setLinkBIs(response.data);
                setFilteredLinks(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Không thể tải danh sách link. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Lọc link theo tìm kiếm
    useEffect(() => {
        const filtered = linkBIs.filter((link) =>
            link.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredLinks(filtered);
    }, [searchQuery, linkBIs]);

    return (
        <View className="flex-1">

            {/* Loading state */}
            {loading && (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            )}

            {/* Error state */}
            {error && (
                <Text className={`text-red-500 text-center mb-4`} style={{ fontSize }}>
                    {error}
                </Text>
            )}

            {/* Danh sách link */}
            {!loading && !error && (
                <View>
                    {filteredLinks.map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            className="flex flex-row items-center mb-3 rounded-xl bg-gray-100 p-2"
                            onPress={() => navigation.navigate('WebViewBI', { url: link.url, name: link.name })}
                        >
                            <Icon source={require('../assets/powerBILogo.png')} size={fontSize + 14} color="#2563EB" />
                            <Text
                                className={`font-semibold`}
                                style={{ fontSize }}
                            >
                                {link.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

export default PowerBI;