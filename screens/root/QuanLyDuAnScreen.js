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
    Alert,
    RefreshControl,
} from "react-native"
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker'
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import ProjectCard from "./../../components/ProjectCard"
import { useNavigation } from "@react-navigation/native"
import { duAnRoute, uploadFileRoute } from '../../api/baseURL'
import axiosInstance from '../../utils/axiosInstance';
import unidecode from 'unidecode';
import { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import CreateOrUpdateDuAnModal from "../../components/CreateOrUpdateDuAnModal";

const ProjectManagement = ({ navigation }) => {
    const [projects, setProjects] = useState([])
    const [attachFiles, setAttachFiles] = useState([])
    const [activeFilter, setActiveFilter] = useState("all")
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [errors, setErrors] = useState({});
    const [action, setAction] = useState("_CREATE") // "create" or "update"
    const [editingProject, setEditingProject] = useState(null)

    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
    const [isDueDatePickerVisible, setIsDueDatePickerVisible] = useState(false)
    const [isStartDatePickerVisible, setIsStartDatePickerVisible] = useState(false)
    const [loading, setLoading] = useState(true)
    const [processLoading, setProcessLoading] = useState(false)

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
    useEffect(() => {
        fetchProjects()
    }, [])

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
    const showModal = (project = null) => {
        setAttachFiles([]) // Reset attached files when showing modal
        setProcessLoading(false)
        if (project) {
            setAction("_UPDATE")
            setEditingProject({
                id: project.id,
                tenDuAn: project.tenDuAn,
                attachedFiles: (project.fileDinhKem),
                ghiChu: project.ghiChu,
                trangThai: project.trangThai,
                moTa: project.moTa,
                batDau: project.batDau.split('T')[0],
                ketThuc: project.ketThuc.split('T')[0],
            })
        } else {
            setAction("_CREATE")
            setEditingProject({
                tenDuAn: '',
                ketThuc: '',
                attachedFiles: '',
                ghiChu: '',
                trangThai: 1,
                moTa: '',
                batDau: new Date().toISOString().split('T')[0], // Default to today
            })
        }

        setIsModalVisible(true)
    }
    const hideModal = () => {
        setIsModalVisible(false)
        setIsDueDatePickerVisible(false)

        setIsStartDatePickerVisible(false)
    }
    const handleSaveProject = async (project, action, attachFiles) => {
        console.log("handleSaveProject", action)
        const newErrors = {};
        if (!project.tenDuAn) newErrors.tenDuAn = "Vui lòng nhập tên dự án.";
        if (!project.ketThuc) newErrors.ketThuc = "Vui lòng chọn ngày dự kiến hoàn thành.";
        //if (!editedEvent.gioKetThuc) newErrors.gioKetThuc = "Vui lòng chọn giờ kết thúc.";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }

        setProcessLoading(true)
        console.log("attachFiles", attachFiles)
        console.log("project", project.attachedFiles)
        // Nếu có file đính kèm thì gọi API upload file trước
        if (attachFiles.length > 0 && attachFiles !== project.attachedFiles) {
            const formData = new FormData();
            console.log("IM HỂ")
            attachFiles.forEach((file) => {
                formData.append("files", {
                    uri: file.uri,
                    name: file.name,
                    type: file.type,
                });
            })

            try {
                const response = await axiosInstance.post(uploadFileRoute.uploadFile, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                // Nếu lỗi thì dừng
                if (response.status < 200 || response.status >= 300) {
                    Alert.alert("Lỗi", response.data.message);
                    return;
                }

            } catch (error) {
                console.log(error);
                const errorMessage = error.response ? error.response.data.message : error.message;
                Alert.alert("Lỗi", errorMessage);
                return;
            }
        }

        try {
            if (action === "_CREATE") {
                // Add new project
                const newProject = {
                    tenDuAn: project.tenDuAn,
                    ketThuc: project.ketThuc,
                    fileDinhKem: JSON.stringify(attachFiles.map(file => file.name)),
                    ghiChu: project.ghiChu,
                    trangThai: project.trangThai,
                    moTa: project.moTa,
                    batDau: project.batDau,
                }
                console.log("PAY LOAD", newProject)
                const response = await axiosInstance.post(duAnRoute.create, newProject)

                if (response.status !== 201) {
                    Alert.alert("Error", "Failed to create project")
                }
                Toast.show({
                    type: "success",
                    text1: "Thêm mới thành công",
                })
                fetchProjects()
            } else if (action === "_UPDATE") {
                // Update existing project
                console.log("upading project", project.id)
                const updatedProject = {
                    id: project.id,
                    tenDuAn: project.tenDuAn,
                    ketThuc: project.ketThuc,
                    fileDinhKem: JSON.stringify(attachFiles.map(file => file.name)),
                    ghiChu: project.ghiChu,
                    trangThai: project.trangThai,
                    moTa: project.moTa,
                    batDau: project.batDau,
                }
                console.log('=================================', `${duAnRoute.update}/${project.id}`)
                console.log("updatedProject", updatedProject)
                const response = await axiosInstance.put(`${duAnRoute.update}/${project.id}`, updatedProject)
                Toast.show({
                    type: "success",
                    text1: "Cập nhật thành công",
                })
                if (response.status !== 201) {
                    Alert.alert("Error", "Failed to update project")
                }
                fetchProjects()
            }
        } catch (error) {
            console.error("Error saving project:", error.response.data.message)
            Toast.show({
                type: "error",
                text1: error.response ? error.response.data.message : "Có lỗi xảy ra khi lưu dự án",
                position: 'top',
                visibilityTime: 3000,
            });
        } finally {
            hideModal()
            setProcessLoading(false)
            setEditingProject(null)
            setAttachFiles([]) // Reset attached files after saving
        }
    }

    const deleteProject = (id) => {
        setProjects(projects.filter((project) => project.id !== id))
    }

    const editProject = (project) => {
        showModal(project)
    }

    const filteredProjects = () => {
        switch (activeFilter) {
            case 3:
                return projects.filter((project) => project.trangThai === 3)
            case 2:
                return projects.filter((project) => project.trangThai === 2)
            case 1:
                return projects.filter((project) => project.trangThai === 1)
            default:
                return projects
        }
    }

    // Hàm kiểm tra JSON và trả về mảng file hoặc mảng rỗng
    const parseFileAttachments = (fileDinhKem) => {
        if (typeof fileDinhKem === "string") {
            try {
                const parsed = JSON.parse(fileDinhKem)
                console.log("parsed", parsed)
                return Array.isArray(parsed) ? parsed : []
            } catch (error) {
                return []
            }
        }
        return []
    }
    const formatDateToISO = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    }
    // Hàm chọn file
    const handleFileChange = async () => {
        try {
            // Cho phép người dùng chọn nhiều file
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*", // Cho phép tất cả các loại file
                multiple: true, // Cho phép chọn nhiều file
            });

            // Kiểm tra nếu người dùng hủy
            if (result.canceled) {
                return;
            }
            // Kiểm tra số lượng file (tối đa 5 file)
            if (result.assets[0].length > 5) {
                Toast.show({
                    type: "error",
                    text1: "Chỉ được phép tải lên tối đa 5 tệp",
                    position: 'top',
                    visibilityTime: 3000,
                });
                return;
            }
            console.log("result.assets", result.assets);
            // Kiểm tra định dạng file (chỉ cho phép .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf)
            const allowedExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf'];
            const invalidFiles = result.assets.filter(file => {
                const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
                return !allowedExtensions.includes(fileExtension);
            });

            if (invalidFiles.length > 0) {
                Alert.alert("Lỗi", "Chỉ được phép tải lên các tệp DOC, DOCX, XLS, XLSX, PPT, PPTX, PDF");
                return;
            }

            const now = new Date();
            const dateStr = formatDateToISO(now);
            const newFiles = result.assets.map(file => {
                return {
                    uri: file.uri,
                    name: unidecode(dateStr + "_" + file.name),
                    type: file.mimeType,
                };
            });

            // Lưu các file vào state
            setEditingProject({ ...editingProject, attachedFiles: (newFiles.map(file => file.name)) });

            setAttachFiles(newFiles);
            // setEditedEvent({ ...editedEvent, fileDinhKem: JSON.stringify(newFiles.map(file => file.name)) });
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi chọn file.");
        }
    };

    const getFilterLabel = (filter) => {
        switch (filter) {
            case "all": return `Tất cả (${projects.length})`
            case 1: return `Dự kiến (${projects.filter(p => p.trangThai === 1).length})`
            case 2: return `Đang tiến hành (${projects.filter(p => p.trangThai === 2).length})`
            case 3: return `Hoàn thành (${projects.filter(p => p.trangThai === 3).length})`
            default: return ""
        }
    }
    const renderFilterItem = ({ item }) => (
        <TouchableOpacity
            className={`mr-4 px-3 py-1 rounded-full ${activeFilter === item ? "bg-blue-100" : ""}`}
            onPress={() => setActiveFilter(item)}
        >
            <Text className={`${activeFilter === item ? "text-blue-700" : "text-gray-600"}`}>{getFilterLabel(item)}</Text>
        </TouchableOpacity>
    )
    return (
        <View className="flex-1 bg-gray-50">
            <View className="flex-row px-4 py-3 bg-white border-b border-gray-200 overflow-x-auto">
                <FlatList
                    horizontal
                    data={["all", 1, 2, 3]}
                    renderItem={renderFilterItem}
                    keyExtractor={(item) => item.toString()}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {/* Project List */}
            <ScrollView
                className="flex-1 px-4 py-4"
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchProjects} />
                }
            >
                {projects && filteredProjects().map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
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

            <CreateOrUpdateDuAnModal
                setEditingProject={setEditingProject}
                isModalVisible={isModalVisible}
                hideModal={hideModal}
                loading={processLoading}
                project={editingProject}
                errors={errors}
                isDueDatePickerVisible={isDueDatePickerVisible}
                isStartDatePickerVisible={isStartDatePickerVisible}
                setIsStartDatePickerVisible={setIsStartDatePickerVisible}
                setIsDueDatePickerVisible={setIsDueDatePickerVisible}
                handleFileChange={handleFileChange}
                setAttachFiles={setAttachFiles}
                attachFiles={attachFiles}
                handleSaveProject={() => handleSaveProject(editingProject, action, attachFiles)}
                action={action}
                setErrors={setErrors}
            />
        </View >
    )
}

export default ProjectManagement
