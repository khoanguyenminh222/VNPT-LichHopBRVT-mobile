"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Keyboard } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Modal } from "react-native-paper"
import TaskCard from "./../../components/TaskCard"
import { duAnRoute } from "../../api/baseURL"

const { height } = Dimensions.get("window")

// Sample projects data - in a real app, this would be shared state or from a context/API
const PROJECTS = [
    {
        id: "1",
        title: "Mobile App Redesign",
        color: "#3b82f6", // blue
    },
    {
        id: "2",
        title: "Backend API Development",
        color: "#10b981", // green
    },
    {
        id: "3",
        title: "Marketing Website",
        color: "#f59e0b", // amber
    },
]

// Sample tasks data
const INITIAL_TASKS = [
    {
        id: "1",
        title: "Design new user interface",
        description: "Create wireframes and mockups for the new mobile app UI",
        status: "In Progress",
        priority: "High",
        projectId: "1",
        dueDate: "2023-06-25",
        assignedTo: "1", // user ID
    },
    {
        id: "2",
        title: "Implement authentication API",
        description: "Create REST endpoints for user authentication",
        status: "Completed",
        priority: "High",
        projectId: "2",
        dueDate: "2023-05-10",
        assignedTo: "3",
    },
    {
        id: "3",
        title: "Create landing page",
        description: "Design and implement the main landing page",
        status: "Not Started",
        priority: "Medium",
        projectId: "3",
        dueDate: "2023-07-05",
        assignedTo: "2",
    },
    {
        id: "4",
        title: "Fix navigation bugs",
        description: "Address issues with the navigation drawer",
        status: "In Progress",
        priority: "Medium",
        projectId: "1",
        dueDate: "2023-06-28",
        assignedTo: "4",
    },
    {
        id: "5",
        title: "Set up database schema",
        description: "Create database models and migrations",
        status: "Completed",
        priority: "High",
        projectId: "2",
        dueDate: "2023-05-08",
        assignedTo: "5",
    },
]

// Sample users data
const USERS = [
    { id: "1", name: "John Doe", avatar: "JD", role: "Developer" },
    { id: "2", name: "Jane Smith", avatar: "JS", role: "Designer" },
    { id: "3", name: "Mike Johnson", avatar: "MJ", role: "Product Manager" },
    { id: "4", name: "Sarah Williams", avatar: "SW", role: "QA Engineer" },
    { id: "5", name: "Alex Brown", avatar: "AB", role: "DevOps" },
]

const TaskManagement = ({ navigation }) => {
    const [tasks, setTasks] = useState(INITIAL_TASKS)
    const [filteredProjectId, setFilteredProjectId] = useState(null)
    const [statusFilter, setStatusFilter] = useState("all")
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [editingTask, setEditingTask] = useState(null)

    // Project filter state
    const [isProjectFilterVisible, setIsProjectFilterVisible] = useState(null)
    // Task form state
    const [taskTitle, setTaskTitle] = useState("")
    const [taskDescription, setTaskDescription] = useState("")
    const [taskStatus, setTaskStatus] = useState("Not Started")
    const [taskPriority, setTaskPriority] = useState("Medium")
    const [taskProjectId, setTaskProjectId] = useState("")
    const [taskDueDate, setTaskDueDate] = useState("")
    const [taskAssignedTo, setTaskAssignedTo] = useState("")

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

    const showModal = (task = null) => {
        if (task) {
            setEditingTask(task)
            setTaskTitle(task.title)
            setTaskDescription(task.description || "")
            setTaskStatus(task.status)
            setTaskPriority(task.priority)
            setTaskProjectId(task.projectId)
            setTaskDueDate(task.dueDate)
            setTaskAssignedTo(task.assignedTo)
        } else {
            setEditingTask(null)
            setTaskTitle("")
            setTaskDescription("")
            setTaskStatus("Not Started")
            setTaskPriority("Medium")
            setTaskProjectId(filteredProjectId || "")
            setTaskDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]) // 1 week from now
            setTaskAssignedTo("")
        }

        setIsModalVisible(true)
    }

    const hideModal = () => {
        setIsModalVisible(false)
    }

    const hideProjectFilterModal = () => {
        setIsProjectFilterVisible(false)
    }
    const handleSaveTask = () => {
        if (taskTitle.trim() === "" || !taskProjectId) return

        if (editingTask) {
            // Update existing task
            const updatedTasks = tasks.map((task) =>
                task.id === editingTask.id
                    ? {
                        ...task,
                        title: taskTitle,
                        description: taskDescription,
                        status: taskStatus,
                        priority: taskPriority,
                        projectId: taskProjectId,
                        dueDate: taskDueDate,
                        assignedTo: taskAssignedTo,
                    }
                    : task,
            )
            setTasks(updatedTasks)
        } else {
            // Add new task
            const newTask = {
                id: Date.now().toString(),
                title: taskTitle,
                description: taskDescription,
                status: taskStatus,
                priority: taskPriority,
                projectId: taskProjectId,
                dueDate: taskDueDate,
                assignedTo: taskAssignedTo,
            }
            setTasks([...tasks, newTask])
        }

        hideModal()
    }

    const deleteTask = (id) => {
        setTasks(tasks.filter((task) => task.id !== id))
    }

    const editTask = (task) => {
        showModal(task)
    }

    const getFilteredTasks = () => {
        return tasks
            .filter((task) => (filteredProjectId ? task.projectId === filteredProjectId : true))
            .filter((task) => (statusFilter !== "all" ? task.status === statusFilter : true))
            .filter((task) =>
                searchQuery
                    ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchQuery.toLowerCase())
                    : true,
            )
    }

    const getProjectById = (id) => {
        return PROJECTS.find((project) => project.id === id) || { title: "Unknown Project", color: "#6b7280" }
    }

    const getUserById = (id) => {
        return USERS.find((user) => user.id === id) || { name: "Unassigned", avatar: "?", role: "" }
    }

    return (
        <View className="flex-1 bg-gray-50 pb-14">
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
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== "" && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={18} color="#6b7280" />
                        </TouchableOpacity>
                    )}
                </View>

                <View className="flex-col justify-between">
                    {/* Project Filter */}
                    <View className="flex-row items-center">
                        <Text className="text-sm text-gray-600 mr-2">Dự án:</Text>
                        <View className="flex-row bg-gray-100 rounded-lg overflow-hidden">
                            <TouchableOpacity
                                className={`px-3 py-1 ${filteredProjectId === null ? "bg-blue-500" : "bg-gray-100"}`}
                                onPress={() => setIsProjectFilterVisible(true)}
                            >
                                <Text className={`text-sm ${filteredProjectId === null ? "text-white" : "text-gray-800"}`}>{PROJECTS.find((x) => x.id === filteredProjectId)}</Text>
                            </TouchableOpacity>


                        </View>
                    </View>

                    {/* Status Filter */}
                    <View className="flex-row items-center">
                        <Text className="text-sm text-gray-600 mr-2">Trạng thái:</Text>
                        <View className="flex-row bg-gray-100 rounded-lg overflow-hidden">
                            <TouchableOpacity
                                className={`px-3 py-1 ${statusFilter === "all" ? "bg-blue-500" : "bg-gray-100"}`}
                                onPress={() => setStatusFilter("all")}
                            >
                                <Text className={`text-sm ${statusFilter === "all" ? "text-white" : "text-gray-800"}`}>Tất cả</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`px-3 py-1 ${statusFilter === "Not Started" ? "bg-blue-500" : "bg-gray-100"}`}
                                onPress={() => setStatusFilter("Not Started")}
                            >
                                <Text className={`text-sm ${statusFilter === "Not Started" ? "text-white" : "text-gray-800"}`}>
                                    Chưa bắt đầu
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`px-3 py-1 ${statusFilter === "In Progress" ? "bg-blue-500" : "bg-gray-100"}`}
                                onPress={() => setStatusFilter("In Progress")}
                            >
                                <Text className={`text-sm ${statusFilter === "In Progress" ? "text-white" : "text-gray-800"}`}>
                                    Đang thực hiện
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`px-3 py-1 ${statusFilter === "Completed" ? "bg-blue-500" : "bg-gray-100"}`}
                                onPress={() => setStatusFilter("Completed")}
                            >
                                <Text className={`text-sm ${statusFilter === "Completed" ? "text-white" : "text-gray-800"}`}>Hoàn thành</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            {/* Task List */}
            <ScrollView className="flex-1 px-4 py-4">
                {getFilteredTasks().length > 0 ? (
                    getFilteredTasks().map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            project={getProjectById(task.projectId)}
                            assignedUser={getUserById(task.assignedTo)}
                            onDelete={() => deleteTask(task.id)}
                            onEdit={() => editTask(task)}
                        />
                    ))
                ) : (
                    <View className="items-center justify-center py-10">
                        <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
                        <Text className="text-gray-400 mt-2 text-center">No tasks found</Text>
                        <Text className="text-gray-400 text-center">Try changing your filters or add a new task</Text>
                    </View>
                )}

                {/* Add New Task Button */}
                <TouchableOpacity
                    className="flex-row items-center mb-10 justify-center bg-white rounded-lg shadow-md p-4 border border-dashed border-gray-300 mt-2"
                    onPress={() => showModal()}
                >
                    <Ionicons name="add" size={20} color="#3b82f6" />
                    <Text className="ml-2 text-blue-500 font-medium">Add New Task</Text>
                </TouchableOpacity>
            </ScrollView>
            <Modal
                visible={isProjectFilterVisible}
                onDismiss={hideProjectFilterModal}
                contentContainerStyle={{
                    backgroundColor: "white",
                    margin: 20,
                    borderRadius: 16,
                    maxHeight: height * 0.8,
                    zIndex: 1000,
                }}
            >
                <View className="p-4" style={{ maxHeight: height * 0.8, minHeight: 200 }}>
                    <Text className={`text-sm ${filteredProjectId === null ? "text-black" : "text-gray-800"}`}>All</Text>
                    {PROJECTS.map((project) => (
                        <TouchableOpacity
                            key={project.id}
                            className={`px-3 py-1 ${filteredProjectId === project.id ? "bg-blue-500" : "bg-gray-100"}`}
                            onPress={() => setFilteredProjectId(project.id)}
                        >
                            <Text className={`text-sm ${filteredProjectId === project.id ? "text-white" : "text-gray-800"}`}>
                                {project.title.split(" ")[0]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </Modal>
            {/* Task Modal */}
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
                <View className="p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-semibold">{editingTask ? "Edit Task" : "New Task"}</Text>
                        <TouchableOpacity onPress={hideModal}>
                            <Ionicons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="max-h-96">
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Task Title</Text>
                            <TextInput
                                className="border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Enter task title"
                                value={taskTitle}
                                onChangeText={setTaskTitle}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Description</Text>
                            <TextInput
                                className="border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Enter task description"
                                value={taskDescription}
                                onChangeText={setTaskDescription}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Project</Text>
                            <View className="border border-gray-300 rounded-md overflow-hidden">
                                {PROJECTS.map((project) => (
                                    <TouchableOpacity
                                        key={project.id}
                                        className={`px-3 py-2 flex-row items-center ${taskProjectId === project.id ? "bg-gray-100" : ""}`}
                                        onPress={() => setTaskProjectId(project.id)}
                                    >
                                        <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: project.color }} />
                                        <Text>{project.title}</Text>
                                        {taskProjectId === project.id && (
                                            <Ionicons name="checkmark" size={18} color="#3b82f6" style={{ marginLeft: "auto" }} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Status</Text>
                            <View className="border flex-row border-gray-300 rounded-md overflow-hidden">
                                <TouchableOpacity
                                    className={`px-3 py-2 ${taskStatus === "Not Started" ? "bg-gray-100" : ""}`}
                                    onPress={() => setTaskStatus("Not Started")}
                                >
                                    <Text>Not Started</Text>
                                </TouchableOpacity>
                                <View className="border-t border-gray-300" />
                                <TouchableOpacity
                                    className={`px-3 py-2 ${taskStatus === "In Progress" ? "bg-gray-100" : ""}`}
                                    onPress={() => setTaskStatus("In Progress")}
                                >
                                    <Text>In Progress</Text>
                                </TouchableOpacity>
                                <View className="border-t border-gray-300" />
                                <TouchableOpacity
                                    className={`px-3 py-2 ${taskStatus === "Completed" ? "bg-gray-100" : ""}`}
                                    onPress={() => setTaskStatus("Completed")}
                                >
                                    <Text>Completed</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên</Text>
                            <View className="border flex-row border-gray-300 rounded-md overflow-hidden">
                                <TouchableOpacity
                                    className={`px-3 py-2 ${taskPriority === "Low" ? "bg-gray-100" : ""}`}
                                    onPress={() => setTaskPriority("Low")}
                                >
                                    <Text>Low</Text>
                                </TouchableOpacity>
                                <View className="border-t border-gray-300" />
                                <TouchableOpacity
                                    className={`px-3 py-2 ${taskPriority === "Medium" ? "bg-gray-100" : ""}`}
                                    onPress={() => setTaskPriority("Medium")}
                                >
                                    <Text>Medium</Text>
                                </TouchableOpacity>
                                <View className="border-t border-gray-300" />
                                <TouchableOpacity
                                    className={`px-3 py-2 ${taskPriority === "High" ? "bg-gray-100" : ""}`}
                                    onPress={() => setTaskPriority("High")}
                                >
                                    <Text>High</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Due Date</Text>
                            <TextInput
                                className="border border-gray-300 rounded-md px-3 py-2"
                                placeholder="YYYY-MM-DD"
                                value={taskDueDate}
                                onChangeText={setTaskDueDate}
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Assigned To</Text>
                            <View className="border border-gray-300 rounded-md overflow-hidden">
                                <TouchableOpacity
                                    className={`px-3 py-2 ${taskAssignedTo === "" ? "bg-gray-100" : ""}`}
                                    onPress={() => setTaskAssignedTo("")}
                                >
                                    <Text>Unassigned</Text>
                                </TouchableOpacity>
                                <View className="border-t border-gray-300" />
                                {USERS.map((user) => (
                                    <TouchableOpacity
                                        key={user.id}
                                        className={`px-3 py-2 flex-row items-center ${taskAssignedTo === user.id ? "bg-gray-100" : ""}`}
                                        onPress={() => setTaskAssignedTo(user.id)}
                                    >
                                        <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
                                            <Text className="text-xs text-blue-700">{user.avatar}</Text>
                                        </View>
                                        <Text>{user.name}</Text>
                                        {taskAssignedTo === user.id && (
                                            <Ionicons name="checkmark" size={18} color="#3b82f6" style={{ marginLeft: "auto" }} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View className="flex-row justify-end space-x-3 mt-2">
                        <TouchableOpacity className="px-4 py-2 rounded-md bg-gray-200" onPress={hideModal}>
                            <Text className="text-gray-800">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="px-4 py-2 rounded-md bg-blue-500" onPress={handleSaveTask}>
                            <Text className="text-white">{editingTask ? "Update" : "Create"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default TaskManagement
