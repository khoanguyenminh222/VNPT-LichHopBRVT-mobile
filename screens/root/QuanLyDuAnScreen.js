"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Keyboard,
    Pressable,
    FlatList,
    Platform,
} from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker'
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { Modal } from "react-native-paper"
import ProjectCard from "./../../components/ProjectCard"
import { useNavigation } from "@react-navigation/native"
import { duAnRoute } from "../../api/baseURL"

const { height } = Dimensions.get("window")

// Sample users data
const USERS = [
    { id: "1", name: "John Doe", avatar: "JD", role: "Developer" },
    { id: "2", name: "Jane Smith", avatar: "JS", role: "Designer" },
    { id: "3", name: "Mike Johnson", avatar: "MJ", role: "Product Manager" },
    { id: "4", name: "Sarah Williams", avatar: "SW", role: "QA Engineer" },
    { id: "5", name: "Alex Brown", avatar: "AB", role: "DevOps" },
]

const ProjectManagement = ({ navigation }) => {
    const [projects, setProjects] = useState([
        {
            id: "1",
            title: "Mobile App Redesign",
            tasks: 12,
            completed: 5,
            dueDate: "2023-06-30",
            status: "In Progress",
            users: ["1", "2"],
        },
        {
            id: "2",
            title: "Backend API Development",
            tasks: 8,
            completed: 8,
            dueDate: "2023-05-15",
            status: "Completed",
            users: ["3", "5"],
        },
        {
            id: "3",
            title: "Marketing Website",
            tasks: 5,
            completed: 2,
            dueDate: "2023-07-10",
            status: "In Progress",
            users: ["2", "4"],
        },
        {
            id: "7",
            title: "Mobile App Redesign",
            tasks: 12,
            completed: 5,
            dueDate: "2023-06-30",
            status: "In Progress",
            users: ["1", "2"],
        },
        {
            id: "8",
            title: "Backend API Development",
            tasks: 8,
            completed: 8,
            dueDate: "2023-05-15",
            status: "Completed",
            users: ["3", "5"],
        },
        {
            id: "9",
            title: "Marketing Website",
            tasks: 5,
            completed: 2,
            dueDate: "2023-07-10",
            status: "In Progress",
            users: ["2", "4"],
        },
        {
            id: "4",
            title: "Mobile App Redesign",
            tasks: 12,
            completed: 5,
            dueDate: "2023-06-30",
            status: "In Progress",
            users: ["1", "2"],
        },
        {
            id: "5",
            title: "Backend API Development",
            tasks: 8,
            completed: 8,
            dueDate: "2023-05-15",
            status: "Completed",
            users: ["3", "5"],
        },
        {
            id: "6",
            title: "Marketing Website",
            tasks: 5,
            completed: 2,
            dueDate: "2023-07-10",
            status: "In Progress",
            users: ["2", "4"],
        },
    ])

    const [activeFilter, setActiveFilter] = useState("all")
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [projectTitle, setProjectTitle] = useState("")
    const [projectDueDate, setProjectDueDate] = useState("")
    const [projectStatus, setProjectStatus] = useState("Not Started")
    const [editingProject, setEditingProject] = useState(null)
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState([])
    const [isUserSelectionVisible, setIsUserSelectionVisible] = useState(false)
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setIsKeyboardVisible(true)
        })
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setIsKeyboardVisible(false)
        })

        return () => {
            keyboardDidShowListener.remove()
            keyboardDidHideListener.remove()
        }
    }, [])

    const showModal = (project = null) => {
        if (project) {
            setEditingProject(project)
            setProjectTitle(project.title)
            setProjectDueDate(project.dueDate)
            setProjectStatus(project.status)
            setSelectedUsers(project.users || [])
        } else {
            setEditingProject(null)
            setProjectTitle("")
            setProjectDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]) // 2 weeks from now
            setProjectStatus("Not Started")
            setSelectedUsers([])
        }

        setIsModalVisible(true)
    }

    const hideModal = () => {
        setIsModalVisible(false)
        setIsUserSelectionVisible(false)
    }

    const handleSaveProject = () => {
        if (projectTitle.trim() === "") return

        if (editingProject) {
            // Update existing project
            const updatedProjects = projects.map((project) =>
                project.id === editingProject.id
                    ? {
                        ...project,
                        title: projectTitle,
                        dueDate: projectDueDate,
                        status: projectStatus,
                        users: selectedUsers,
                    }
                    : project,
            )
            setProjects(updatedProjects)
        } else {
            // Add new project
            const newProject = {
                id: Date.now().toString(),
                title: projectTitle,
                tasks: 0,
                completed: 0,
                dueDate: projectDueDate,
                status: projectStatus,
                users: selectedUsers,
            }
            console.log(newProject)
            setProjects([...projects, newProject])
        }

        hideModal()
    }

    const deleteProject = (id) => {
        setProjects(projects.filter((project) => project.id !== id))
    }

    const editProject = (project) => {
        showModal(project)
    }

    const toggleUserSelection = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId))
        } else {
            setSelectedUsers([...selectedUsers, userId])
        }
    }

    const getUsersForProject = (userIds) => {
        return USERS.filter((user) => userIds.includes(user.id))
    }

    const filteredProjects = () => {
        switch (activeFilter) {
            case "completed":
                return projects.filter((project) => project.status === "Completed")
            case "inProgress":
                return projects.filter((project) => project.status === "In Progress")
            case "notStarted":
                return projects.filter((project) => project.status === "Not Started")
            default:
                return projects
        }
    }

    const renderUserItem = ({ item }) => {
        const isSelected = selectedUsers.includes(item.id)

        return (
            <TouchableOpacity
                className={`flex-row items-center p-3 border-b border-gray-100 ${isSelected ? "bg-blue-50" : ""}`}
                onPress={() => toggleUserSelection(item.id)}
            >
                <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Text className="font-medium text-blue-700">{item.avatar}</Text>
                </View>
                <View className="flex-1">
                    <Text className="font-medium">{item.name}</Text>
                    <Text className="text-gray-500 text-sm">{item.role}</Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />}
            </TouchableOpacity>
        )
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="flex-row px-4 py-3 bg-white border-b border-gray-200 overflow-x-auto">
                <TouchableOpacity
                    className={`mr-4 px-3 py-1 rounded-full ${activeFilter === "all" ? "bg-blue-100" : ""}`}
                    onPress={() => setActiveFilter("all")}
                >
                    <Text className={`${activeFilter === "all" ? "text-blue-700" : "text-gray-600"}`}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`mr-4 px-3 py-1 rounded-full ${activeFilter === "inProgress" ? "bg-blue-100" : ""}`}
                    onPress={() => setActiveFilter("inProgress")}
                >
                    <Text className={`${activeFilter === "inProgress" ? "text-blue-700" : "text-gray-600"}`}>In Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`mr-4 px-3 py-1 rounded-full ${activeFilter === "completed" ? "bg-blue-100" : ""}`}
                    onPress={() => setActiveFilter("completed")}
                >
                    <Text className={`${activeFilter === "completed" ? "text-blue-700" : "text-gray-600"}`}>Completed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`mr-4 px-3 py-1 rounded-full ${activeFilter === "notStarted" ? "bg-blue-100" : ""}`}
                    onPress={() => setActiveFilter("notStarted")}
                >
                    <Text className={`${activeFilter === "notStarted" ? "text-blue-700" : "text-gray-600"}`}>Not Started</Text>
                </TouchableOpacity>
            </View>

            {/* Project List */}
            <ScrollView className="flex-1 px-4 py-4 ">
                {filteredProjects().map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        users={getUsersForProject(project.users || [])}
                        onDelete={() => deleteProject(project.id)}
                        onEdit={() => editProject(project)}
                    />
                ))}

                {/* Add New Project Button */}
                <TouchableOpacity
                    className="flex-row items-center justify-center bg-white rounded-lg shadow-md  p-4 border border-dashed border-gray-300 mt-2 mb-12"
                    onPress={() => showModal()}
                >
                    <Ionicons name="add" size={20} color="#3b82f6" />
                    <Text className="ml-2 text-blue-500 font-medium">Thêm dự án mới</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Project Modal */}
            <Modal
                visible={isModalVisible}
                onDismiss={hideModal}
                contentContainerStyle={{
                    backgroundColor: "white",
                    margin: 20,
                    borderRadius: 16,
                    maxHeight: height * 0.8,
                }}
            >
                {isUserSelectionVisible ? (
                    <View className="p-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold">Select Team Members</Text>
                            <TouchableOpacity onPress={() => setIsUserSelectionVisible(false)}>
                                <Ionicons name="arrow-back" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <FlatList data={USERS} renderItem={renderUserItem} keyExtractor={(item) => item.id} className="max-h-96" />

                        <TouchableOpacity
                            className="mt-4 bg-blue-500 py-3 rounded-lg items-center"
                            onPress={() => setIsUserSelectionVisible(false)}
                        >
                            <Text className="text-white font-medium">Done ({selectedUsers.length} selected)</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="p-4">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-semibold">{editingProject ? "Chỉnh sửa" : "Thêm mới"}</Text>
                            <TouchableOpacity onPress={hideModal}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-96">
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Tên dự án</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-md px-3 py-2"
                                    placeholder="Enter project title"
                                    value={projectTitle}
                                    onChangeText={setProjectTitle}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Dự kiến hoàn thành</Text>

                                <TouchableOpacity
                                    className="border border-gray-300 rounded-md px-3 py-2 flex-row items-center justify-between"
                                    onPress={() => setIsDatePickerVisible(true)}
                                >
                                    <Text>{projectDueDate || "Chọn ngày"}</Text>
                                    <FontAwesome5 name="calendar-alt" size={16} color="#6b7280" />
                                </TouchableOpacity>

                                {isDatePickerVisible && (
                                    <DateTimePicker
                                        value={projectDueDate ? new Date(projectDueDate) : new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                        onChange={(event, date) => {
                                            setIsDatePickerVisible(false) // Đóng picker sau khi chọn
                                            if (date) {
                                                setProjectDueDate(date.toISOString().split("T")[0])
                                            }
                                        }}
                                    />
                                )}
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Trạng thái</Text>
                                <View className="border border-gray-300 rounded-md overflow-hidden">
                                    <Pressable
                                        className={`px-3 py-2 ${projectStatus === "Not Started" ? "bg-gray-100" : ""}`}
                                        onPress={() => setProjectStatus("Not Started")}
                                    >
                                        <Text>Dự kiến</Text>
                                    </Pressable>
                                    <View className="border-t border-gray-300" />
                                    <Pressable
                                        className={`px-3 py-2 ${projectStatus === "In Progress" ? "bg-gray-100" : ""}`}
                                        onPress={() => setProjectStatus("In Progress")}
                                    >
                                        <Text>Đang tiến hành</Text>
                                    </Pressable>

                                </View>
                            </View>
                        </ScrollView>

                        <View className="flex-row justify-end gap-4 mt-2">
                            <TouchableOpacity className="px-4 py-2 rounded-md bg-gray-200" onPress={hideModal}>
                                <Text className="text-gray-800">Huỷ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="px-4 py-2 rounded-md bg-blue-500" onPress={handleSaveProject}>
                                <Text className="text-white">{editingProject ? "Thay đổi" : "Thêm mới"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
                }
            </Modal >
        </View >
    )
}

export default ProjectManagement
