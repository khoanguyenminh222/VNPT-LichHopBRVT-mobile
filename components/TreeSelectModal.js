import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { TreeSelect } from 'react-native-tree-selection';

const TreeSelectModal = ({ visible, onClose, onSelect, data, childKey, titleKey }) => {

    const [localSelectedItems, setLocalSelectedItems] = useState(data);

    const handleConfirm = () => {
        onSelect(localSelectedItems); // Trả về các phần tử đã chọn
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
        <Modal transparent={true} visible={visible} onRequestClose={onClose}>
            <View className="flex-1 bg-black/50">
                <View className="bg-white rounded-lg w-96 max-w-[460px] m-auto">
                    <Text className="text-xl p-6 font-bold">Chọn Thành Phần</Text>

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
                            marginBottom: 14,
                        }}
                        parentTextStyles={{
                            color: 'black',
                            fontSize: 16,
                            maxWidth: '80%',
                        }}
                        childContainerStyles={{
                            backgroundColor: 'white',
                            marginBottom: 14,
                            width: 'auto',
                        }}
                        childTextStyles={{
                            color: 'blue',
                            fontSize: 16,

                        }}
                        leftIconStyles={{ tintColor: 'black' }}
                        rightIconStyles={{ tintColor: 'black' }}
                        flatListProps={{
                            style: { maxHeight: 600 },
                            showsVerticalScrollIndicator: false,
                        }}
                    />

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
