import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Button } from 'react-native-paper';
import { TreeSelect } from 'react-native-tree-selection';
import { useFontSize } from '../context/FontSizeContext';

const TreeSelectModal = ({ visible, onClose, onSelect, data, childKey, titleKey, field, initialSelectedOrder = [] }) => {
    const { fontSize } = useFontSize();
    const [localSelectedItems, setLocalSelectedItems] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState([]);

    useEffect(() => {
        // Khởi tạo danh sách đã chọn từ props
        if (data) {
            // Nếu có initialSelectedOrder, sử dụng nó để khởi tạo thứ tự
            if (initialSelectedOrder.length > 0) {
                setSelectedOrder(initialSelectedOrder);
                setLocalSelectedItems(initialSelectedOrder);
            } else {
                // Nếu không có initialSelectedOrder, lấy từ data dựa trên trạng thái isSelected
                const initialSelected = data
                    .filter(item => item.isSelected)
                    .map(item => item[titleKey]);
                setLocalSelectedItems(initialSelected);
                setSelectedOrder(initialSelected);
            }
        }
    }, [data, initialSelectedOrder]);

    const handleConfirm = () => {
        onSelect(selectedOrder, field);
        onClose();
    };

    const onCheckBoxPress = (node) => {
        // Tạo một Map để theo dõi trạng thái mới của các item
        const newStateMap = new Map();
        node.forEach(item => {
            newStateMap.set(item[titleKey], item.isSelected);
        });

        // Lấy danh sách các items mới được chọn
        const newlySelected = node
            .filter(item => item.isSelected && !selectedOrder.includes(item[titleKey]))
            .map(item => item[titleKey]);

        // Lấy danh sách các items bị bỏ chọn
        const unselected = selectedOrder.filter(item => !newStateMap.get(item));

        // Giữ nguyên thứ tự của các items đã chọn trước đó và vẫn được chọn
        const existingOrder = selectedOrder.filter(item => newStateMap.get(item) === true);

        // Kết hợp thứ tự cũ và items mới
        const newSelectedOrder = [...existingOrder, ...newlySelected];

        // Cập nhật state
        setLocalSelectedItems(newSelectedOrder);
        setSelectedOrder(newSelectedOrder);
    };

    return (
        <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-black/50">
                <View className="bg-white rounded-lg w-96 max-w-[460px] m-auto h-5/6">
                    <Text className="text-xl p-6 font-bold">Chọn</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TreeSelect
                            data={data}
                            childKey={childKey}
                            titleKey={titleKey}
                            multiple
                            value={selectedOrder}
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
                                fontSize,
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
                                fontSize,
                                flexShrink: 1,
                                width: '80%',
                            }}
                            leftIconStyles={{ tintColor: 'black', width: fontSize * 1.2, height: fontSize * 1.2 }}
                            rightIconStyles={{ tintColor: 'black', width: fontSize * 1.2, height: fontSize * 1.2 }}
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
            </View>
        </Modal>
    );
};

export default TreeSelectModal;
