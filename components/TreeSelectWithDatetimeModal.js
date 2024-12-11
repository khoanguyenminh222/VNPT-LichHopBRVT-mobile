import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Platform, Pressable, Alert, TouchableWithoutFeedback } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { Button } from 'react-native-paper';
import DateTimePicker from "@react-native-community/datetimepicker";
import { TreeSelect } from 'react-native-tree-selection';

const TreeSelectWithDatetimeModal = ({ visible, onClose, onSelect, data, childKey, titleKey, field }) => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Ngày bắt đầu
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Ngày kết thúc
    const [showPicker, setShowPicker] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false); // Picker cho ngày bắt đầu
    const [showEndPicker, setShowEndPicker] = useState(false); // Picker cho ngày kết thúc

    const [localSelectedItems, setLocalSelectedItems] = useState(data);

    const onCheckBoxPress = (node) => {

        let updatedSelectedNames = [];
        node.forEach((item) => {
            // Nếu có username thì không cho chọn
            if (!item.username) {
                item.isSelected = false;
                Alert.alert('Thông báo', 'Không thể chọn người dùng không có tài khoản');
            }
            if (item.isSelected) {
                updatedSelectedNames.push(item.username);
            }
        });
        setLocalSelectedItems(updatedSelectedNames);
    };

    const handleStartDateChange = (event, date) => {
        if (event.type === 'dismissed') {
            setShowStartPicker(false); // Đóng picker nếu người dùng hủy
            return;
        }
        if (date) {
            const selectedDate = date.toISOString().split('T')[0];
            setStartDate(selectedDate); // Cập nhật ngày bắt đầu
        }
        setShowStartPicker(false); // Đóng picker sau khi chọn
    };
    
    const handleEndDateChange = (event, date) => {
        if (event.type === 'dismissed') {
            setShowEndPicker(false); // Đóng picker nếu người dùng hủy
            return;
        }
        if (date) {
            const selectedDate = date.toISOString().split('T')[0];
            setEndDate(selectedDate); // Cập nhật ngày kết thúc
        }
        setShowEndPicker(false); // Đóng picker sau khi chọn
    };

    const handleConfirm = () => {
        // Kiểm tra ngày bắt đầu và ngày kết thúc
        if (new Date(startDate) >= new Date(endDate)) {
            Alert.alert('Thông báo', 'Ngày kết thúc không thể nhỏ hơn ngày bắt đầu');
            return;
        }
        if (localSelectedItems.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một người dùng');
            return;
        }

        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setLocalSelectedItems([]); // Reset các phần tử đã chọn
        onSelect(localSelectedItems, field, startDate, endDate); // Trả về các phần tử đã chọn
        onClose(); // Đóng modal
    };

    return (
        <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/50">
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View className="bg-white rounded-lg w-96 max-w-[460px] m-auto h-5/6">
                            {/* Ngày bắt đầu */}
                            <View className="my-4 px-4">
                                <Text className="text-base font-semibold mb-2">Ngày bắt đầu * </Text>
                                {Platform.OS === 'ios' ? (
                                    <DateTimePicker
                                        value={new Date(startDate)}
                                        mode="date"
                                        display="default"
                                        onChange={handleStartDateChange}
                                        locale="vi-VN"
                                    />
                                ) : (
                                    <Pressable onPress={() => setShowStartPicker(true)}>
                                        <Text className="border p-2 rounded-md">
                                            {startDate}
                                        </Text>
                                    </Pressable>
                                )}
                            </View>

                            {/* Ngày kết thúc */}
                            <View className="my-4 px-4">
                                <Text className="text-base font-semibold mb-2">Ngày kết thúc * </Text>
                                {Platform.OS === 'ios' ? (
                                    <DateTimePicker
                                        value={new Date(endDate)}
                                        mode="date"
                                        display="default"
                                        onChange={handleEndDateChange}
                                        locale="vi-VN"
                                    />
                                ) : (
                                    <Pressable onPress={() => setShowEndPicker(true)}>
                                        <Text style={{
                                            borderWidth: 1,
                                            padding: 10,
                                            borderRadius: 5,
                                            backgroundColor: '#f9f9f9',
                                        }}>
                                            {endDate}
                                        </Text>
                                    </Pressable>
                                )}
                            </View>

                            {/* Hiển thị picker */}
                            {showStartPicker && (
                                <DateTimePicker
                                    value={new Date(startDate)}
                                    mode="date"
                                    display="default"
                                    onChange={handleStartDateChange}
                                    locale="vi-VN"
                                />
                            )}
                            {showEndPicker && (
                                <DateTimePicker
                                    value={new Date(endDate)}
                                    mode="date"
                                    display="default"
                                    onChange={handleEndDateChange}
                                    locale="vi-VN"
                                />
                            )}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <TreeSelect
                                    data={data}
                                    childKey={childKey}
                                    titleKey={titleKey}
                                    multiple
                                    value={localSelectedItems}
                                    onCheckBoxPress={onCheckBoxPress}
                                    autoSelectParents={false}
                                    autoSelectChildren={false}
                                    parentContainerStyles={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        borderRadius: 8,
                                        marginBottom: 20,

                                    }}
                                    parentTextStyles={{
                                        color: 'black',
                                        fontSize: 16,
                                        flexShrink: 1,
                                        width: '80%',
                                    }}
                                    childContainerStyles={{
                                        backgroundColor: 'white',
                                        marginBottom: 20,
                                        width: 'auto',
                                    }}
                                    childTextStyles={{
                                        color: 'blue',
                                        fontSize: 16,
                                        flexShrink: 1,
                                        width: '80%',
                                    }}
                                    leftIconStyles={{ tintColor: 'black' }}
                                    rightIconStyles={{ tintColor: 'black' }}
                                    flatListProps={{
                                        style: { maxHeight: 600 },
                                        showsVerticalScrollIndicator: false,
                                    }}
                                />
                            </ScrollView>
                            <View className="flex-row justify-between p-6">
                                <Button onPress={onClose} mode="text" textColor="red">
                                    Hủy
                                </Button>
                                <Button onPress={handleConfirm} mode="text" textColor="green">
                                    Xác Nhận
                                </Button>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default TreeSelectWithDatetimeModal;
