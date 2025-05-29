import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, TextInput, Platform, Pressable, Linking } from 'react-native'
import { IconButton, Modal, Surface } from "react-native-paper"
import React from 'react'
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { publicfolder } from './../api/baseURL';


const { height } = Dimensions.get("window")
const CreateOrUpdateDuAnModal = ({
    loading,
    isModalVisible,
    action,
    setErrors,
    hideModal,
    project,
    setEditingProject,
    errors,
    isDueDatePickerVisible,
    isStartDatePickerVisible,
    setIsStartDatePickerVisible,
    setIsDueDatePickerVisible,
    attachFiles,
    handleFileChange,
    setAttachFiles,
    handleSaveProject
}) => {

    // Hàm xử lý khi tải file đính kèm
    const handleDownload = (fileUrl) => {
        // Mở liên kết hoặc tải file nếu có
        Linking.openURL(fileUrl).catch(err => console.error("Failed to open URL:", err));
    };
    return (
        <Modal
            visible={isModalVisible}
            onDismiss={hideModal}
            contentContainerStyle={{
                backgroundColor: "white",
                margin: 20,
                borderRadius: 16,
                maxHeight: height * 0.8,
            }
            }
        >
            <View className="p-4">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-semibold">{action === "_UPDATE" ? "Chỉnh sửa" : "Thêm mới"}</Text>
                    <TouchableOpacity onPress={hideModal}>
                        <Ionicons name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="max-h-96">
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1">Tên dự án (<Text className="text-red-500">*</Text>)</Text>
                        <TextInput
                            className="border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Vd: Dự án quản lý nhân sự"
                            value={project?.tenDuAn}
                            onChangeText={(tenDuAn) => {
                                setEditingProject({ ...project, tenDuAn })
                                setErrors({ ...errors, tenDuAn: "" }) // Xóa lỗi khi người dùng nhập
                            }}
                        />
                        {errors?.tenDuAn && (
                            <Text className="text-red-500 text-sm mt-1">{errors?.tenDuAn}</Text>
                        )}
                    </View>
                    <View className="mb-4 w-fit">
                        <Text className="text-sm font-medium  text-gray-700 mb-1">Mô tả</Text>
                        <TextInput
                            editable
                            multiline
                            numberOfLines={4}
                            className="border border-gray-300 rounded-md px-3 py-2"
                            onChangeText={(moTa) => setEditingProject({ ...project, moTa })}
                            value={project?.moTa}
                        />

                    </View>
                    <View className="mb-4 flex-row justify-between items-center">
                        <View className="w-[40%]">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu (<Text className="text-red-500">*</Text>)</Text>
                            {Platform.OS === "ios" ? (
                                <DateTimePicker
                                    value={project?.batDau ? new Date(project?.batDau) : new Date()}
                                    mode="date"
                                    display='default'
                                    locale="vi-VN"
                                    onChange={(event, date) => {
                                        setIsStartDatePickerVisible(false) // Đóng picker sau khi chọn
                                        if (date) {
                                            setEditingProject({ ...project, batDau: (date.toISOString().split("T")[0]) })
                                            setErrors({ ...errors, batDau: "" }) // Xóa lỗi khi người dùng chọn ngày
                                        }
                                    }}
                                />
                            ) : (
                                <>
                                    <TouchableOpacity
                                        className="border border-gray-300 rounded-md px-3 py-2 flex-row items-center justify-between"
                                        onPress={() => setIsStartDatePickerVisible(true)}
                                    >
                                        <Text>{project?.batDau || "Chọn ngày"}</Text>
                                        <FontAwesome5 name="calendar-alt" size={16} color="#6b7280" />
                                    </TouchableOpacity>
                                    {isStartDatePickerVisible && (
                                        <DateTimePicker
                                            value={project?.batDau ? new Date(project?.batDau) : new Date()}
                                            mode="date"
                                            display='default'
                                            onChange={(event, date) => {
                                                setIsStartDatePickerVisible(false) // Đóng picker sau khi chọn
                                                if (date) {
                                                    setEditingProject({ ...project, batDau: (date.toISOString().split("T")[0]) })
                                                    setErrors({ ...errors, batDau: "" }) // Xóa lỗi khi người dùng chọn ngày
                                                }
                                            }}
                                        />
                                    )}
                                </>

                            )}

                        </View>
                        <Ionicons name="remove-outline" size={28}></Ionicons>
                        <View className="w-[40%]">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Dự kiến hoàn thành (<Text className="text-red-500">*</Text>)</Text>
                            {Platform.OS === "ios" ? (
                                <DateTimePicker
                                    value={project?.ketThuc ? new Date(project?.ketThuc) : new Date()}
                                    mode="date"
                                    display='default'
                                    locale="vi-VN"
                                    onChange={(event, date) => {
                                        setIsDueDatePickerVisible(false) // Đóng picker sau khi chọn
                                        if (date) {
                                            setEditingProject({ ...project, ketThuc: (date.toISOString().split("T")[0]) })
                                            setErrors({ ...errors, ketThuc: "" }) // Xóa lỗi khi người dùng chọn ngày
                                        }
                                    }}
                                />
                            ) : (
                                <>
                                    <TouchableOpacity
                                        className="border border-gray-300 rounded-md px-3 py-2 flex-row items-center justify-between"
                                        onPress={() => setIsDueDatePickerVisible(true)}
                                    >
                                        <Text>{project?.ketThuc || "Chọn ngày"}</Text>
                                        <FontAwesome5 name="calendar-alt" size={16} color="#6b7280" />
                                    </TouchableOpacity>
                                    {isDueDatePickerVisible && (
                                        <DateTimePicker
                                            value={project?.ketThuc ? new Date(project?.ketThuc) : new Date()}
                                            mode="date"
                                            display='default'
                                            onChange={(event, date) => {
                                                setIsDueDatePickerVisible(false) // Đóng picker sau khi chọn
                                                if (date) {
                                                    setEditingProject({ ...project, ketThuc: (date.toISOString().split("T")[0]) })
                                                    setErrors({ ...errors, ketThuc: "" }) // Xóa lỗi khi người dùng chọn ngày
                                                }
                                            }}
                                        />
                                    )}
                                </>

                            )}
                            {errors?.ketThuc && (
                                <Text className="text-red-500 text-sm mt-1">{errors?.ketThuc}</Text>
                            )}
                        </View>
                    </View>

                    <View className="mb-4 w-fit" style={{ alignSelf: "flex-start" }}>
                        <Text className="text-sm font-medium  text-gray-700 mb-1" >Trạng thái (<Text className="text-red-500">*</Text>)</Text>
                        <View className="border border-gray-300 rounded-md flex-row overflow-hidden">
                            {/* status = 1 : Dự kiến, status = 2 : Đang tiến hành, 3 : Hoàn thành */}
                            <Pressable
                                className={`px-3 py-2 ${project?.trangThai === 1 ? "bg-gray-100" : ""}`}
                                onPress={() => setEditingProject({ ...project, trangThai: 1 })}
                                value={project?.trangThai}
                            >
                                <Text>Dự kiến</Text>
                            </Pressable>
                            {/* <View className="border-t border-gray-300" /> */}
                            <Pressable
                                className={`px-3 py-2 ${project?.trangThai === 2 ? "bg-gray-100" : ""}`}
                                onPress={() => setEditingProject({ ...project, trangThai: 2 })}
                                value={project?.trangThai}
                            >
                                <Text>Đang tiến hành</Text>
                            </Pressable>

                        </View>
                    </View>

                    <View className="mb-4 w-fit">
                        <Text className="text-sm font-medium  text-gray-700 mb-1">Ghi chú</Text>
                        <TextInput
                            editable
                            multiline
                            numberOfLines={4}
                            className="border border-gray-300 rounded-md px-3 py-2"
                            onChangeText={(ghiChu) => setEditingProject({ ...project, ghiChu })}
                            value={project?.ghiChu}
                        />

                    </View>
                    <View className="mb-4 w-fit">
                        <Text className="text-sm font-medium  text-gray-700 mb-1">Tệp đính kèm</Text>

                        <TouchableOpacity
                            onPress={handleFileChange}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 12,
                                borderWidth: 1,
                                borderColor: "#d1d5db",
                                borderStyle: "dashed",
                                borderRadius: 8,
                                marginBottom: 16,
                            }}
                        >
                            <IconButton icon="file-upload-outline" size={24} style={{ margin: 0 }} />
                            <Text style={{ color: "#3b82f6", marginLeft: 8 }}>Chọn tệp đính kèm</Text>
                        </TouchableOpacity>
                        {Array.isArray(project?.attachedFiles) && project.attachedFiles.map((file, index) => (
                            <View className="mt-2">
                                <View key={index} className="flex-row px-4 items-center">
                                    <Text className="underline max-w-[80%] text-base" numberOfLines={1}>{file}</Text>
                                    <Ionicons
                                        name="download-outline"
                                        size={20}
                                        color="#3b82f6"
                                        onPress={() => handleDownload(`${publicfolder}/documents/${file}`)}
                                        style={{ marginLeft: 8 }}
                                    />
                                    <Ionicons name="close-circle" size={20} color="#ef4444" style={{ marginLeft: 8 }} onPress={() => {
                                        // Xóa tệp khỏi danh sách
                                        const newFiles = attachFiles.filter((_, i) => i !== index).map(file => file.name)
                                        setAttachFiles(attachFiles.filter((_, i) => i !== index)) // update state
                                        setEditingProject({
                                            ...project,
                                            attachedFiles: newFiles
                                        })
                                    }}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView >

                <View className="flex-row justify-end gap-4 mt-2">
                    <TouchableOpacity className="px-4 py-2 rounded-md bg-gray-200" onPress={hideModal}>
                        <Text className="text-gray-800">Huỷ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-4 py-2 rounded-md bg-blue-500" onPress={handleSaveProject}>
                        {loading ? <Text className="text-white">Đang lưu...</Text> : (
                            <Text className="text-white">{action === "_UPDATE" ? "Thay đổi" : "Thêm mới"}</Text>
                        )}

                    </TouchableOpacity>
                </View>
            </View >
        </Modal >
    )
}

export default CreateOrUpdateDuAnModal

const styles = StyleSheet.create({})