"use client"

import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { Platform } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import SearchInputComponent from "./SearchInputComponent"

const TaskFormView = ({
    action,
    editingTask,
    setEditingTask,
    hideModal,
    handleSaveTask,
    projects,
    errors,
    setErrors,
    isDatePickerVisible,
    setIsDatePickerVisible,
    search,
    setSearch,
    onSelectAssignee,
    getSelectedAssigneeName,
    getSelectedAssigneeNames,
    removeAssignee,
    multiSelect = false,
}) => {
    const filteredProjects =
        projects &&
        projects.filter((project) => {
            const isActive = project?.trangThai !== 3
            const matchesSearch = project.tenDuAn.toLowerCase().includes(search.toLowerCase())
            return isActive && matchesSearch
        })

    const clearSearchText = () => {
        setSearch("")
    }

    // Get selected assignees based on mode
    const selectedAssignees = multiSelect ? getSelectedAssigneeNames() : []
    const singleAssigneeName = !multiSelect ? getSelectedAssigneeName() : ""

    return (
        <>
            <View className="flex-row justify-between items-center mt-2 mb-4">
                <Text className="text-xl font-semibold">{action === "_UPDATE" ? "Chỉnh sửa" : "Thêm mới"}</Text>
                <TouchableOpacity onPress={hideModal}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[35rem]" showsVerticalScrollIndicator={false}>
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Tên công việc</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Nhập tên công việc"
                        value={editingTask?.tenCongViec}
                        onChangeText={(tenCongViec) => setEditingTask({ ...editingTask, tenCongViec })}
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Mô tả</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Nhập mô tả công việc"
                        value={editingTask?.moTa}
                        onChangeText={(moTa) => setEditingTask({ ...editingTask, moTa })}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Chọn dự án</Text>
                    <View className="border border-gray-300 rounded-md overflow-hidden">
                        <SearchInputComponent
                            placeholder="Tìm kiếm dự án..."
                            value={search}
                            onChangeText={(text) => {
                                setSearch(text)
                                setEditingTask({ ...editingTask, duan_id: null })
                            }}
                            clearSearchText={clearSearchText}
                        />
                        {editingTask?.duan_id ? (
                            <TouchableOpacity
                                className="px-5 py-3 border-b-gray-200 border-b-2 flex-row items-center bg-gray-100"
                                onPress={() => setEditingTask({ ...editingTask, duan_id: null })}
                            >
                                <View className="max-w-[80%] flex-row items-center">
                                    <View className="w-3 h-3 rounded-full mr-2 bg-gray-500 gap-2" />
                                    <Text numberOfLines={2}>{projects.find(x => x.id === editingTask.duan_id).tenDuAn}</Text>
                                </View>
                                <Ionicons name="checkmark" size={18} color="#3b82f6" style={{ marginLeft: "auto" }} />
                            </TouchableOpacity>
                        ) : (
                            filteredProjects &&
                            filteredProjects.map((project) => (
                                <TouchableOpacity
                                    key={project.id}
                                    className={`px-5 py-3 border-b-gray-200 border-b-2 flex-row items-center ${editingTask?.duan_id === project.id ? "bg-gray-100" : ""
                                        }`}
                                    onPress={() => setEditingTask({ ...editingTask, duan_id: project.id })}
                                >
                                    <View className="max-w-[80%] flex-row items-center gap-2">
                                        <View className="w-3 h-3 rounded-full mr-2 bg-gray-300" />
                                        <Text
                                            numberOfLines={2}
                                            className={`${editingTask?.duan_id === project.id ? "text-gray-500" : "text-gray-700"}`}
                                        >
                                            {project.tenDuAn}
                                        </Text>
                                    </View>
                                    {editingTask?.duan_id === project.id && (
                                        <Ionicons name="checkmark" size={18} color="#3b82f6" style={{ marginLeft: "auto" }} />
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Trạng thái</Text>
                    <View className="border flex-row border-gray-300 rounded-md overflow-hidden">
                        <TouchableOpacity
                            className={`px-3 py-2 ${editingTask?.trangThai === 1 ? "bg-gray-100" : ""}`}
                            onPress={() => setEditingTask({ ...editingTask, trangThai: 1 })}
                        >
                            <Text>Dự kiến</Text>
                        </TouchableOpacity>
                        <View className="border-t border-gray-300" />
                        <TouchableOpacity
                            className={`px-3 py-2 ${editingTask?.trangThai === 2 ? "bg-gray-100" : ""}`}
                            onPress={() => setEditingTask({ ...editingTask, trangThai: 2 })}
                        >
                            <Text>Thực thi</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên</Text>
                    <View className="border flex-row border-gray-300 rounded-md overflow-hidden">
                        <TouchableOpacity
                            className={`px-5 py-2 ${editingTask?.uuTien === "Thấp" ? "bg-gray-100" : ""}`}
                            onPress={() => setEditingTask({ ...editingTask, uuTien: "Thấp" })}
                        >
                            <Text>Thấp</Text>
                        </TouchableOpacity>
                        <View className="border-t border-gray-300" />
                        <TouchableOpacity
                            className={`px-3 py-2 ${editingTask?.uuTien === "Trung bình" ? "bg-yellow-300" : ""}`}
                            onPress={() => setEditingTask({ ...editingTask, uuTien: "Trung bình" })}
                        >
                            <Text>Trung bình</Text>
                        </TouchableOpacity>
                        <View className="border-t border-gray-300" />
                        <TouchableOpacity
                            className={`px-8 py-2 ${editingTask?.uuTien === "Cao" ? "bg-red-300" : ""}`}
                            onPress={() => setEditingTask({ ...editingTask, uuTien: "Cao" })}
                        >
                            <Text>Cao</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Dự kiến kết thúc</Text>
                    {Platform.OS === "ios" ? (
                        <DateTimePicker
                            value={editingTask?.ketThuc ? new Date(editingTask?.ketThuc) : new Date()}
                            mode="date"
                            display="default"
                            locale="vi-VN"
                            onChange={(event, date) => {
                                setIsDatePickerVisible(false)
                                if (date) {
                                    setEditingTask({ ...editingTask, ketThuc: date.toISOString().split("T")[0] })
                                    setErrors({ ...errors, ketThuc: "" })
                                }
                            }}
                        />
                    ) : (
                        <>
                            <TouchableOpacity
                                className="border border-gray-300 rounded-md px-3 py-2 flex-row items-center justify-between"
                                onPress={() => setIsDatePickerVisible(true)}
                            >
                                <Text>{editingTask?.ketThuc || "Chọn ngày"}</Text>
                                <FontAwesome5 name="calendar-alt" size={16} color="#6b7280" />
                            </TouchableOpacity>
                            {isDatePickerVisible && (
                                <DateTimePicker
                                    value={editingTask?.ketThuc ? new Date(editingTask?.ketThuc) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => {
                                        setIsDatePickerVisible(false)
                                        if (date) {
                                            setEditingTask({ ...editingTask, ketThuc: date.toISOString().split("T")[0] })
                                            setErrors({ ...errors, ketThuc: "" })
                                        }
                                    }}
                                />
                            )}
                        </>
                    )}
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                        {multiSelect ? "Phân công cho (nhiều người)" : "Phân công cho"}
                    </Text>

                    {/* Multi-select: Selected Assignees Display */}
                    {multiSelect && selectedAssignees.length > 0 && (
                        <View className="mb-3">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                                <View className="flex-row gap-2">
                                    {selectedAssignees.map((assignee) => (
                                        <View key={assignee.id} className="flex-row items-center bg-blue-100 rounded-full px-3 py-2">
                                            <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-2">
                                                <Text className="text-xs font-medium text-white">
                                                    {assignee.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </Text>
                                            </View>
                                            <Text className="text-sm text-blue-800 font-medium mr-2" numberOfLines={1}>
                                                {assignee.name}
                                            </Text>
                                            {removeAssignee && (
                                                <TouchableOpacity
                                                    onPress={() => removeAssignee(assignee.id)}
                                                    className="w-5 h-5 rounded-full bg-blue-200 items-center justify-center"
                                                >
                                                    <Ionicons name="close" size={12} color="#1e40af" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                            <Text className="text-xs text-gray-500">{selectedAssignees.length} người được phân công</Text>
                        </View>
                    )}

                    {/* Add Assignee Button */}
                    <TouchableOpacity
                        className="border border-gray-300 rounded-md px-3 py-3 flex-row items-center justify-between"
                        onPress={onSelectAssignee}
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                                <Ionicons name={multiSelect ? "people" : "person-add"} size={16} color="#3b82f6" />
                            </View>
                            <Text className="flex-1 text-gray-700" numberOfLines={1}>
                                {multiSelect
                                    ? selectedAssignees.length === 0
                                        ? "Chọn người thực hiện"
                                        : "Quản lý người thực hiện"
                                    : singleAssigneeName || "Chọn người thực hiện"}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                    </TouchableOpacity>
                </View>
            </ScrollView >

            <View className="flex-row justify-end gap-4 mt-2">
                <TouchableOpacity className="px-4 py-2 rounded-md bg-gray-200" onPress={hideModal}>
                    <Text className="text-gray-800">Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-4 py-2 rounded-md bg-blue-500" onPress={handleSaveTask}>
                    <Text className="text-white">{action === "_UPDATE" ? "Lưu chỉnh sửa" : "Thêm mới"}</Text>
                </TouchableOpacity>
            </View>
        </>
    )
}

export default TaskFormView
