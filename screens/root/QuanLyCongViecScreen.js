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
    RefreshControl,
    Alert,
    SafeAreaView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import TaskCard from "./../../components/TaskCard"
import { duAnRoute, taskRoute } from "../../api/baseURL"
import axiosInstance from "../../utils/axiosInstance"
import CreateOrUpdateTaskModal from "../../components/CreateOrUpdateTaskModal"
import DuAnFilterModal from "./../../components/DuAnFilterModal"
import { useAuth } from '../../context/AuthContext';
import Toast from "react-native-toast-message"

const { height } = Dimensions.get("window")



const TaskManagement = ({ navigation }) => {
    const [tasks, setTasks] = useState()
    const [filteredProjectId, setFilteredProjectId] = useState(null)
    const [statusFilter, setStatusFilter] = useState("all")
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [editingTask, setEditingTask] = useState(null)
    const [loading, setLoading] = useState(false)
    const [assigneesData, setAssigneesData] = useState([])
    const [action, setAction] = useState("_CREATE")

    // Project filter state
    const [isProjectFilterVisible, setIsProjectFilterVisible] = useState(false)
    const [projects, setProjects] = useState()

    // Task form state 
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
    const [selectedProject, setSelectedProject] = useState(null)
    // Handle keyboard visibility
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

    //Fetch projects from API
    useEffect(() => {
        fetchProjects()
        fetchTasks()
        fetchAssignees()
    }, [])

    const fetchTasks = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get(taskRoute.findAll)
            if (response.status === 200) {
                console.log("Tasks fetched successfully:", response.data)
                setTasks(response.data)
            } else {
                Alert.alert("Error", "Failed to fetch tasks")
            }
        } catch (error) {
            console.error(error)
            Alert.alert("Error", "Failed to fetch tasks")
        } finally {
            setLoading(false)
        }
    }
    const fetchProjects = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get(duAnRoute.findAll)
            if (response.status === 200) {
                setProjects(response.data)
            } else {
                Alert.alert("Error", "Failed to fetch projects")
            }
        } catch (error) {
            console.error(error)
            Alert.alert("Error", "Failed to fetch projects")
        } finally {
            setLoading(false)
        }
    }
    const fetchAssignees = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get(taskRoute.getAssignees) // Adjust the endpoint as needed
            if (response.status === 200) {
                console.log("Assignees fetched successfully:", response.data)
                setAssigneesData(response.data)
            } else {
                setAssigneesData(response.data)
            }
        } catch (error) {
            console.error(error)
            Alert.alert("Thông báo", "Lấy danh sách người được giao công việc thất bại")
        } finally {
            setLoading(false)
        }
    }

    const showModal = (task = null) => {
        if (task) {
            task.ketThuc = task.ketThuc.split("T")[0] || task.ketThuc // Ensure date is in YYYY-MM-DD format
            setEditingTask(task)
            setAction("_UPDATE")
        } else {
            setEditingTask({
                tenCongViec: "",
                moTa: "",
                trangThai: 1,
                uuTien: "Thấp",
                duan_id: null,
                ketThuc: "",
                assignee_ids: [],
            })
            setAction("_CREATE")
        }

        setIsModalVisible(true)
    }

    const hideModal = () => {
        setIsModalVisible(false)
    }

    const handleSaveTask = async () => {

        if (action === "_UPDATE" && editingTask) {
            console.log('updating task:', editingTask)
            try {
                const reponse = await axiosInstance.put(`${taskRoute.update}/${editingTask.id}`, editingTask)
                if (reponse.status === 200) {
                    Toast.show({
                        type: 'success',
                        text1: 'Thành công',
                        text2: 'Cập nhật nhiệm vụ thành công',
                    })
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Lỗi',
                        text2: 'Cập nhật nhiệm vụ thất bại',
                    })
                }

            } catch (error) {
                console.error("Error updating task:", error)
                Alert.alert("Error", "Failed to update task")
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Cập nhật nhiệm vụ thất bại',
                })
            } finally {
                fetchTasks() // Refresh tasks after update
                hideModal()
            }

        } else if (action === "_CREATE") {
            try {
                console.log("PAYLOAD:", editingTask)
                const response = await axiosInstance.post(taskRoute.create, editingTask)
                if (response.status === 200 || response.status === 201) {
                    const newTask = {
                        ...editingTask,
                        id: response.data.id, // Assuming the API returns the created task with an ID
                    }
                    Toast.show({
                        type: 'success',
                        text1: 'Thành công',
                        text2: 'Tạo nhiệm vụ thành công',
                    })

                }
            } catch (error) {
                console.error("Error creating task:", error)
                Alert.alert("Error", "Failed to create task")

            } finally {
                fetchTasks() // Refresh tasks after creation
                hideModal()
            }
        }
    }

    const deleteTask = (id) => {
        setTasks(tasks.filter((task) => task.id !== id))
    }

    const editTask = (task) => {
        showModal(task)
    }

    const getFilteredTasks = () => {
        if (tasks === undefined) return []
        return tasks
            .filter((task) => (filteredProjectId ? task.duan_id === filteredProjectId : true))
            .filter((task) => (statusFilter !== "all" ? task.trangThai === statusFilter : true))
            .filter((task) =>
                searchQuery
                    ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchQuery.toLowerCase())
                    : true,
            )
    }

    const getProjectById = (id) => {
        return projects?.find((project) => project.id === id) || { title: "Unknown Project", color: "#6b7280" }
    }

 

    const getSelectedProjectName = () => {
        if (filteredProjectId === null) return "Tất cả"
        const project = projects?.find((x) => x.id === filteredProjectId)
        return project?.tenDuAn || "Unknown Project"
    }

    const { user } = useAuth
    return (
        <SafeAreaView className="flex-1 bg-gray-50 pb-14">
            <View className="px-4 pt-8 py-6 bg-white shadow-sm flex-row items-center gap-4 border-b border-gray-200">
                <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-800">Nhiệm vụ</Text>
            </View>

            {/* Search and Filters */}
            <View className="px-4 py-3 bg-white border-b border-gray-200">
                <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
                    <Ionicons name="search" size={18} color="#6b7280" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-800"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== "" && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={18} color="#6b7280" />
                        </TouchableOpacity>
                    )}
                </View>

                <View className="flex-col justify-between gap-4">
                    {/* Project Filter */}
                    <View className="flex-row items-center">
                        <Text className="text-sm text-gray-600 mr-2">Dự án:</Text>
                        <TouchableOpacity
                            className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 flex-1"
                            onPress={() => setIsProjectFilterVisible(true)}
                        >
                            <View
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                    backgroundColor: filteredProjectId
                                        ? projects?.find((p) => p.id === filteredProjectId)?.color || "#6b7280"
                                        : "#3b82f6",
                                }}
                            />
                            <Text className="text-sm text-gray-800 flex-1" numberOfLines={1}>
                                {getSelectedProjectName()}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Status Filter */}
                    <View className="flex-row items-center">
                        <Text className="text-sm text-gray-600 mr-2">Trạng thái:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                            <View className="flex-row  bg-gray-100 rounded-lg overflow-hidden">
                                <TouchableOpacity
                                    className={`px-3 py-1 ${statusFilter === "all" ? "bg-blue-500" : "bg-gray-100"}`}
                                    onPress={() => setStatusFilter("all")}
                                >
                                    <Text className={`text-sm ${statusFilter === "all" ? "text-white" : "text-gray-800"}`}>Tất cả</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`px-3 py-1 ${statusFilter === 1 ? "bg-blue-500" : "bg-gray-100"}`}
                                    onPress={() => setStatusFilter(1)}
                                >
                                    <Text className={`text-sm ${statusFilter === 1 ? "text-white" : "text-gray-800"}`}>
                                        Dự kiến
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`px-3 py-1 ${statusFilter === 2 ? "bg-blue-500" : "bg-gray-100"}`}
                                    onPress={() => setStatusFilter(2)}
                                >
                                    <Text className={`text-sm ${statusFilter === 2 ? "text-white" : "text-gray-800"}`}>
                                        Đang thực thi
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`px-3 py-1 ${statusFilter === 3 ? "bg-blue-500" : "bg-gray-100"}`}
                                    onPress={() => setStatusFilter(3)}
                                >
                                    <Text className={`text-sm ${statusFilter === 3 ? "text-white" : "text-gray-800"}`}>
                                        Hoàn thành
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>

            {/* Task List */}
            <ScrollView
                className="flex-1 px-4 py-4"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchTasks()} />}
            >
                {getFilteredTasks().length > 0 ? (
                    getFilteredTasks().map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            project={getProjectById(task.projectId)} 
                            onDelete={() => deleteTask(task.id)}
                            onEdit={() => editTask(task)}
                        />
                    ))
                ) : (
                    <View className="items-center justify-center py-10">
                        <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
                        <Text className="text-gray-400 mt-2 text-center">Không tìm thấy công việc</Text>
                        <Text className="text-gray-400 text-center">Thử đổi bộ lọc hoặc tạo công việc mới</Text>
                    </View>
                )}

                {/* Add New Task Button */}
                <TouchableOpacity
                    className="flex-row items-center mb-10 justify-center bg-white rounded-lg shadow-md p-4 border border-dashed border-gray-300 mt-2"
                    onPress={() => showModal()}
                >
                    <Ionicons name="add" size={20} color="#3b82f6" />
                    <Text className="ml-2 text-blue-500 font-medium">Thêm mới</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Project Filter Modal */}
            <DuAnFilterModal
                visible={isProjectFilterVisible}
                onDismiss={() => setIsProjectFilterVisible(false)}
                projects={projects || []}
                selectedProjectId={filteredProjectId}
                onSelectProject={setFilteredProjectId}
            />

            <CreateOrUpdateTaskModal
                action={action}
                isModalVisible={isModalVisible}
                hideModal={hideModal}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
                handleSaveTask={handleSaveTask}
                projects={projects}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject} 
                isDatePickerVisible={isDatePickerVisible}
                setIsDatePickerVisible={setIsDatePickerVisible}
                assigneesData={assigneesData}
            />
        </SafeAreaView>
    )
}

export default TaskManagement
