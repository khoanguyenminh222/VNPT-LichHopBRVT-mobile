import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { formatDate } from "../utils/dateTimeUtils"

const ProjectCard = ({ project, onDelete, onEdit }) => {

  const getStatusClasses = (status) => {
    switch (status) {
      case 3:
        return {
          container: "bg-green-100",
          text: "text-green-800",
        }
      case 2:
        return {
          container: "bg-blue-100",
          text: "text-blue-800",
        }
      case 1:
      default:
        return {
          container: "bg-gray-100",
          text: "text-gray-800",
        }
    }
  }
  const statusClasses = getStatusClasses(project.trangThai)

  const getProgressPercentage = () => {
    if (project.soLuongCongViec === 0) return 0
    return Math.round((project.soLuongCongViecHoanThanh / project.soLuongCongViec) * 100)
  }

  return (
    <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{project.tenDuAn}</Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-gray-500 mr-2">Hạn: {formatDate(project.ketThuc)}</Text>
            <View className={`px-2 py-0.5 rounded-full ${statusClasses.container}`}>
              <Text className={`text-xs font-medium ${statusClasses.text}`}>
                {project.trangThaiText}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="p-2" onPress={onEdit} accessibilityLabel="Edit project">
            <Ionicons name="pencil-outline" size={18} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={onDelete} accessibilityLabel="Delete project">
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-3">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-xs text-gray-500">Tiến độ</Text>
          <Text className="text-xs text-gray-500">{getProgressPercentage()}%</Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View className="h-full bg-blue-500 rounded-full" style={{ width: `${getProgressPercentage()}%` }} />
        </View>
      </View>

      <View className="flex-row justify-between mt-3">
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={14} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1">
            {project.soLuongCongViecHoanThanh}/{project.soLuongCongViec} hoàn thành
          </Text>
        </View>
      </View>
    </View >
  )
}

export default ProjectCard
