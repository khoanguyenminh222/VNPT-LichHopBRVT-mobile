import { View, Text, Modal, Pressable, ScrollView, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const DetailLichHopModal = ({ event, visible, onClose, fontSize = 14, applyHighlight, parseFileAttachments, handleDownload, publicfolder }) => {

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={() => onClose()}>
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white w-11/12 max-h-[80%] rounded-xl p-4">
                        <ScrollView>
                            <View
                                className={`${event?.trangThai === 'huy' ? 'bg-gray-100 border-gray-500' :
                                    event?.trangThai === 'dangKy' ? 'bg-purple-100 border-purple-500' :
                                        event?.quanTrong === 1 ? 'bg-red-100 border-red-500' :
                                            'bg-blue-100 border-blue-500'} p-6 rounded-xl border`}
                            >
                                {/* Tên sự kiện */}
                                <Text
                                    style={{ fontSize: Number(fontSize) + 6 }}
                                    className={`${event?.trangThai === 'huy' ? 'text-gray-900 line-through' :
                                        event?.trangThai === 'dangKy' ? 'text-purple-900' :
                                            event?.quanTrong === 1 ? 'text-red-900' :
                                                'text-blue-900'} font-bold text-2xl mb-2 mt-4`}
                                >
                                    {applyHighlight(event?.noiDungCuocHop)}
                                </Text>

                                {/* Địa điểm */}
                                <Text
                                    style={{ fontSize: Number(fontSize) + 4 }}
                                    className={`${event?.trangThai === 'huy' ? 'text-gray-700 line-through' :
                                        event?.trangThai === 'dangKy' ? 'text-purple-700' :
                                            event?.quanTrong === 1 ? 'text-red-700' :
                                                'text-blue-700'} text-xl mb-2 font-extrabold`}
                                >
                                    {event?.diaDiem !== 'Khác' ? applyHighlight(event?.diaDiem) : applyHighlight(event?.ghiChu)}
                                </Text>

                                {/* Thời gian */}
                                <Text
                                    style={{ fontSize: Number(fontSize) }}
                                    className={`${event?.trangThai === 'huy' ? 'text-gray-500 line-through' :
                                        event?.trangThai === 'dangKy' ? 'text-purple-500' :
                                            event?.quanTrong === 1 ? 'text-red-500' :
                                                'text-blue-500'} mb-2`}
                                >
                                    Thời gian: <Text
                                        style={{ fontSize: Number(fontSize) + 4 }}
                                        className="font-semibold text-xl"
                                    >
                                        {applyHighlight(event?.gioBatDau)}{' '}
                                        {event?.gioKetThuc != null && event?.gioKetThuc !== 'Inval' &&
                                            `- ${applyHighlight(event?.gioKetThuc)}`}
                                    </Text>
                                </Text>

                                {/* Chủ trì */}
                                <Text
                                    style={{ fontSize: Number(fontSize) }}
                                    className={`${event?.trangThai === 'huy' ? 'text-gray-600 line-through' :
                                        event?.trangThai === 'dangKy' ? 'text-purple-600' :
                                            event?.quanTrong === 1 ? 'text-red-600' :
                                                'text-blue-600'} mb-2`}
                                >
                                    Chủ trì: {applyHighlight(event?.chuTri)}
                                </Text>

                                {/* Chuẩn bị (nếu có) */}
                                {event?.chuanBi && (
                                    <Text
                                        style={{ fontSize: Number(fontSize) }}
                                        className={`${event?.trangThai === 'huy' ? 'text-gray-600 line-through' :
                                            event?.trangThai === 'dangKy' ? 'text-purple-600' :
                                                event?.quanTrong === 1 ? 'text-red-600' :
                                                    'text-blue-600'} mb-2`}
                                    >
                                        Chuẩn bị: {applyHighlight(event?.chuanBi)}
                                    </Text>
                                )}

                                {/* Thành phần */}
                                <Text
                                    style={{ fontSize: Number(fontSize) }}
                                    className={`${event?.trangThai === 'huy' ? 'text-gray-600 line-through' :
                                        event?.trangThai === 'dangKy' ? 'text-purple-600' :
                                            event?.quanTrong === 1 ? 'text-red-600' :
                                                'text-blue-600'} mb-2`}
                                >
                                    Thành phần:
                                    {event?.thanhPhan && applyHighlight(event?.thanhPhan.split('\n').map(line => `\n- ${line}`).join('\n'))}
                                    {event?.ghiChuThanhPhan && applyHighlight(`\n${event?.ghiChuThanhPhan}`)}
                                </Text>

                                {/* Mời (nếu có) */}
                                {event?.moi && (
                                    <Text
                                        style={{ fontSize: Number(fontSize) }}
                                        className={`${event?.trangThai === 'huy' ? 'text-gray-600 line-through' :
                                            event?.trangThai === 'dangKy' ? 'text-purple-600' :
                                                event?.quanTrong === 1 ? 'text-red-600' :
                                                    'text-blue-600'} mb-2`}
                                    >
                                        Mời: {applyHighlight(event?.moi)}
                                    </Text>
                                )}

                                {/* Ghi chú (nếu có) */}
                                {event?.ghiChu && (
                                    <Text
                                        style={{ fontSize: Number(fontSize) }}
                                        className={`${event?.trangThai === 'huy' ? 'text-gray-600 line-through' :
                                            event?.trangThai === 'dangKy' ? 'text-purple-600' :
                                                event?.quanTrong === 1 ? 'text-red-600' :
                                                    'text-blue-600'} mb-2`}
                                    >
                                        Ghi chú: {applyHighlight(event?.ghiChu)}
                                    </Text>
                                )}

                                {/* File đính kèm */}
                                {event?.fileDinhKem && event?.trangThai !== 'huy' && (
                                    <View className="mt-4">
                                        <Text
                                            style={{ fontSize: Number(fontSize) }}
                                            className={`${event?.trangThai === 'dangKy' ? 'text-purple-800' :
                                                event?.quanTrong === 1 ? 'text-red-800' :
                                                    'text-blue-800'} font-semibold`}
                                        >
                                            File đính kèm
                                        </Text>
                                        {parseFileAttachments(event?.fileDinhKem).map((fileName, index) => (
                                            <Pressable
                                                key={index}
                                                onPress={() => handleDownload(`${publicfolder}/documents/${fileName}`)}
                                                className={`py-2 px-4 mt-2 rounded-md ${event?.trangThai === 'dangKy' ? 'bg-purple-500 active:bg-purple-600' :
                                                        event?.quanTrong === 1 ? 'bg-red-500 active:bg-red-600' :
                                                            'bg-blue-500 active:bg-blue-600'
                                                    }`}
                                            >
                                                <Text
                                                    style={{ fontSize: Number(fontSize) }}
                                                    className="flex items-center text-white"
                                                >
                                                    <FontAwesomeIcon
                                                        color='white'
                                                        icon={faDownload}
                                                        className="mr-2"
                                                        size={Number(fontSize) - 2}
                                                    />
                                                    {applyHighlight(fileName)}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        {/* Close button */}
                        <Pressable
                            className="mt-4 bg-gray-500 py-2 px-4 rounded-md self-center"
                            onPress={() => {
                                onClose();
                            }}
                        >
                            <Text className="text-white font-semibold">Đóng</Text>
                        </Pressable>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default DetailLichHopModal;