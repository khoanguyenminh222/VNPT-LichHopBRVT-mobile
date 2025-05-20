import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const TaskCard = ({ task, project, assignedUser, onDelete, onEdit }) => {
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
      case "High":
        return <Ionicons name="flag" size={16} color="#ef4444" />
      case "Medium":
        return <Ionicons name="flag" size={16} color="#f59e0b" />
      case "Low":
        return <Ionicons name="flag" size={16} color="#10b981" />
      default:
        return <Ionicons name="flag-outline" size={16} color="#6b7280" />
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600"
      case "Medium":
        return "text-amber-600"
      case "Low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getDaysRemaining = () => {
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const diffTime = dueDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return <Text className="text-xs text-red-600">Overdue by {Math.abs(diffDays)} days</Text>
    } else if (diffDays === 0) {
      return <Text className="text-xs text-red-600">Due today</Text>
    } else if (diffDays === 1) {
      return <Text className="text-xs text-amber-600">Due tomorrow</Text>
    } else {
      return <Text className="text-xs text-gray-500">Due in {diffDays} days</Text>
    }
  }

  return (
    <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: project.color }} />
            <Text className="text-xs text-gray-500">{project.title}</Text>
          </View>
          <Text className="text-lg font-semibold text-gray-800">{task.title}</Text>
          {task.description && (
            <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
              {task.description}
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
            <Text className="text-xs font-medium">{task.status}</Text>
          </View>
          <View className="flex-row items-center">
            {getPriorityIcon(task.priority)}
            <Text className={`text-xs ml-1 ${getPriorityText(task.priority)}`}>{task.priority}</Text>
          </View>
        </View>

        {getDaysRemaining()}
      </View>

      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
        {assignedUser && assignedUser.id ? (
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
              <Text className="text-xs text-blue-700">{assignedUser.avatar}</Text>
            </View>
            <Text className="text-xs text-gray-600">{assignedUser.name}</Text>
          </View>
        ) : (
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={16} color="#6b7280" />
            <Text className="text-xs text-gray-500 ml-1">Unassigned</Text>
          </View>
        )}

        <Text className="text-xs text-gray-500">{task.dueDate}</Text>
      </View>
    </View>
  )
}

export default TaskCard
