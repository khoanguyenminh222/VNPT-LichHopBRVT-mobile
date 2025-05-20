import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const ProjectCard = ({ project, users = [], onDelete, onEdit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Not Started":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressPercentage = () => {
    if (project.tasks === 0) return 0
    return Math.round((project.completed / project.tasks) * 100)
  }

  return (
    <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{project.title}</Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-gray-500 mr-2">Hạn: {project.dueDate}</Text>
            <View className={`px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
              <Text className="text-xs font-medium">{project.status}</Text>
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
            {project.completed}/{project.tasks} hoàn thành
          </Text>
        </View>

        {users.length > 0 && (
          <View className="flex-row">
            {users.slice(0, 3).map((user, index) => (
              <View
                key={user.id}
                className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center border border-white"
                style={{ marginLeft: index > 0 ? -8 : 0 }}
              >
                <Text className="text-xs text-blue-700">{user.avatar}</Text>
              </View>
            ))}
            {users.length > 3 && (
              <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center border border-white ml-[-8px]">
                <Text className="text-xs text-gray-700">+{users.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default ProjectCard
