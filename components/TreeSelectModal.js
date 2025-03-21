import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Button } from 'react-native-paper';
import { TreeSelect } from 'react-native-tree-selection';
import { useFontSize } from '../context/FontSizeContext';

const TreeSelectModal = ({ visible, onClose, onSelect, data, childKey, titleKey, field }) => {
    const { fontSize } = useFontSize();
    const [localSelectedItems, setLocalSelectedItems] = useState(data);

    const handleConfirm = () => {
        onSelect(localSelectedItems, field); // Trả về các phần tử đã chọn
        onClose(); // Đóng modal
    };

    const onCheckBoxPress = (node) => {
        let updatedSelectedNames = [];
        node.forEach((item) => {
            if (item.isSelected) {
                updatedSelectedNames.push(item[titleKey]);
            }
        });
        setLocalSelectedItems(updatedSelectedNames);
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
