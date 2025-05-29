import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const TaskCard = ({ task, project, onDelete, onEdit }) => {
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "Cao":
        return <Ionicons name="flag" size={16} color="#ef4444" />
      case "Trung bình":
        return <Ionicons name="flag" size={16} color="#f59e0b" />
      case "Thấp":
        return <Ionicons name="flag" size={16} color="#10b981" />
      default:
        return <Ionicons name="flag-outline" size={16} color="#6b7280" />
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case "Cao":
        return "text-red-600"
      case "Trung bình":
        return "text-amber-600"
      case "Thấp":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getDaysRemaining = () => {
    const today = new Date()
    const dueDate = new Date(task.ketThuc)
    const diffTime = dueDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return <Text className="text-xs text-red-600">Quá hạn {Math.abs(diffDays)} ngày</Text>
    } else if (diffDays === 0) {
      return <Text className="text-xs text-red-600">Hạn hôm nay</Text>
    } else if (diffDays === 1) {
      return <Text className="text-xs text-amber-600">Hạn ngày mai </Text>
    } else {
      return <Text className="text-xs text-gray-500">Còn {diffDays} ngày</Text>
    }
  }

  return (
    <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: project.color }} />
            <Text className="text-xs text-gray-500">{project.tenDuAn}</Text>
          </View>
          <Text className="text-lg font-semibold text-gray-800">{task.tenCongViec}</Text>
          {task.moTa && (
            <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
              {task.moTa}
            </Text>
          )}
        </View>
        <View className="flex-row">
          <TouchableOpacity className="p-2" onPress={onEdit} accessibilityLabel="Edit task">
            <Ionicons name="pencil-outline" size={18} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={onDelete} accessibilityLabel="Delete task">
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center">
          <View className={`px-2 py-0.5 rounded-full mr-2 ${getStatusColor(task.status)}`}>
            <Text className="text-xs font-medium">{task.trangThaiText}</Text>
          </View>
          <View className="flex-row items-center">
            {getPriorityIcon(task.uuTien)}
            <Text className={`text-xs ml-1 ${getPriorityText(task.uuTien)}`}>{task.uuTien}</Text>
          </View>
        </View>

        {getDaysRemaining()}
      </View>

      <View className="flex-row  mt-3 pt-3 border-t border-gray-100">
        {task?.account_names ? task.account_names.split(",").map((assignedUser, index) => (
          <View key={index} className="flex-row items-center">
            <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
              <Text className="text-xs text-blue-700">{assignedUser
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 1)
                .toUpperCase()}
              </Text>
            </View>
            {/* <Text className="text-xs text-gray-600">{assignedUser}</Text> */}
          </View>
        )) : (
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={16} color="#6b7280" />
            <Text className="text-xs text-gray-500 ml-1">Chưa phân công</Text>
          </View>
        )}

        <Text className="text-xs text-gray-500">{task.dueDate}</Text>
      </View>
    </View>
  )
}

export default TaskCard
