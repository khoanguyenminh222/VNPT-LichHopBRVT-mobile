"use client"

import { useState, useMemo } from "react"
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const AssigneeSelectionView = ({
    assigneesData,
    editingTask,
    onSelectAssignee,
    onBack,
    hideModal,
    getSelectedAssigneeName,
    getSelectedAssigneeNames,
    clearAllAssignees,
    removeAssignee,
    multiSelect = true, // New prop to enable/disable multi-select
    maxSelections = null, // Optional limit on number of selections
}) => {
    const [assigneeSearch, setAssigneeSearch] = useState("")
    const [expandedDepartments, setExpandedDepartments] = useState(new Set())

    // Flatten all accounts for search
    const allAccounts = useMemo(() => {
        const flattenAccounts = (departments) => {
            let accounts = []
            departments.forEach((dept) => {
                accounts = [...accounts, ...dept.accounts]
                if (dept.children && dept.children.length > 0) {
                    accounts = [...accounts, ...flattenAccounts(dept.children)]
                }
            })
            return accounts
        }
        return flattenAccounts(assigneesData || [])
    }, [assigneesData])

    // Filter accounts based on search
    const filteredAccounts = useMemo(() => {
        if (!assigneeSearch.trim()) return []
        return allAccounts.filter(
            (account) =>
                account.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
                account.username.toLowerCase().includes(assigneeSearch.toLowerCase()),
        )
    }, [allAccounts, assigneeSearch])

    // Get current selections based on mode
    const selectedAssignees = multiSelect ? getSelectedAssigneeName() : []
    const selectedAssigneeIds = multiSelect ? editingTask?.assignee_ids || [] : []
    const singleSelectedId = !multiSelect ? editingTask?.assignee_ids : null
 
    const clearAssigneeSearch = () => {
        setAssigneeSearch("")
    }

    const handleSelectAssignee = (assigneeId) => {
        if (multiSelect) {
            // Multi-select mode: toggle selection
            onSelectAssignee(assigneeId)
        } else {
            // Single-select mode: select and go back
            onSelectAssignee(assigneeId)
            setAssigneeSearch("")
        }
    }

    const toggleDepartment = (deptId) => {
        const newExpanded = new Set(expandedDepartments)
        if (newExpanded.has(deptId)) {
            newExpanded.delete(deptId)
        } else {
            newExpanded.add(deptId)
        }
        setExpandedDepartments(newExpanded)
    }

    // Get department path for an account
    const getDepartmentPath = (accountId) => {
        const findPath = (departments, path = []) => {
            for (const dept of departments) {
                const currentPath = [...path, dept.tenPhongBan]

                // Check if account is in this department
                if (dept.accounts.some((acc) => acc.id === accountId)) {
                    return currentPath
                }

                // Check children
                if (dept.children && dept.children.length > 0) {
                    const childPath = findPath(dept.children, currentPath)
                    if (childPath) return childPath
                }
            }
            return null
        }

        const path = findPath(assigneesData || [])
        return path ? path.join(" > ") : ""
    }

    // Check if account is selected (works for both single and multi mode)
    const isAccountSelected = (accountId) => {
        if (multiSelect) {
            return selectedAssigneeIds.includes(accountId)
        } else {
            return singleSelectedId === accountId
        }
    }

    // Check if we can select more (for multi-select with limits)
    const canSelectMore = () => {
        if (!multiSelect) return true
        if (!maxSelections) return true
        return selectedAssignees.length < maxSelections
    }

    const renderAccount = (account, showDepartment = false) => {
        const isSelected = isAccountSelected(account.id)
        const canSelect = canSelectMore() || isSelected

        return (
            <TouchableOpacity
                key={account.id}
                className={`flex-row items-center px-4 py-3 border-b border-gray-50 ${isSelected ? "bg-blue-50" : "bg-white"
                    } ${!canSelect ? "opacity-50" : ""}`}
                onPress={() => canSelect && handleSelectAssignee(account.id)}
                activeOpacity={canSelect ? 0.7 : 1}
                disabled={!canSelect}
            >
                <View className="flex-row items-center flex-1">
                    <View
                        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isSelected ? "bg-blue-500" : "bg-blue-100"
                            }`}
                    >
                        <Text className={`text-sm font-medium ${isSelected ? "text-white" : "text-blue-700"}`}>
                            {account.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text
                            className={`text-base font-medium ${isSelected ? "text-blue-700" : "text-gray-800"}`}
                            numberOfLines={1}
                        >
                            {account.name}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">
                            {account.vaiTro} • {account.username}
                        </Text>
                        {showDepartment && (
                            <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
                                {getDepartmentPath(account.id)}
                            </Text>
                        )}
                    </View>
                </View>
                {multiSelect ? (
                    isSelected ? (
                        <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                    ) : (
                        <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    )
                ) : (
                    isSelected && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                )}
            </TouchableOpacity>
        )
    }

    const renderDepartment = (department, level = 0) => {
        const isExpanded = expandedDepartments.has(department.id)
        const hasAccounts = department.accounts && department.accounts.length > 0
        const hasChildren = department.children && department.children.length > 0
        const paddingLeft = level * 16

        // Count selected accounts in this department (including children) - only for multi-select
        const getSelectedCountInDepartment = (dept) => {
            if (!multiSelect) return 0
            let count = 0
            dept.accounts.forEach((account) => {
                if (isAccountSelected(account.id)) count++
            })
            if (dept.children) {
                dept.children.forEach((child) => {
                    count += getSelectedCountInDepartment(child)
                })
            }
            return count
        }

        const selectedCount = getSelectedCountInDepartment(department)

        return (
            <View key={department.id}>
                {/* Department Header */}
                <TouchableOpacity
                    className="flex-row items-center px-4 py-3 bg-gray-50 border-b border-gray-100"
                    style={{ paddingLeft: paddingLeft + 16 }}
                    onPress={() => toggleDepartment(department.id)}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center flex-1">
                        {(hasAccounts || hasChildren) && (
                            <Ionicons
                                name={isExpanded ? "chevron-down" : "chevron-forward"}
                                size={16}
                                color="#6b7280"
                                style={{ marginRight: 8 }}
                            />
                        )}
                        <Ionicons name="business-outline" size={18} color="#6b7280" style={{ marginRight: 8 }} />
                        <Text className="text-sm font-medium text-gray-700 flex-1" numberOfLines={2}>
                            {department.tenPhongBan}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        {multiSelect && selectedCount > 0 && (
                            <View className="bg-blue-500 rounded-full px-2 py-1">
                                <Text className="text-xs text-white font-medium">{selectedCount}</Text>
                            </View>
                        )}
                        {hasAccounts && (
                            <View className="bg-gray-200 rounded-full px-2 py-1">
                                <Text className="text-xs text-gray-700 font-medium">{department.accounts.length}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Department Content */}
                {isExpanded && (
                    <View>
                        {/* Accounts in this department */}
                        {hasAccounts && (
                            <View style={{ paddingLeft: paddingLeft + 16 }}>
                                {department.accounts
                                    .filter((account) => account.trangThai === 1) // Only active accounts
                                    .map((account) => renderAccount(account))}
                            </View>
                        )}

                        {/* Child departments */}
                        {hasChildren && department.children.map((childDept) => renderDepartment(childDept, level + 1))}
                    </View>
                )}
            </View>
        )
    }

    // Get display text for current selection
    const getSelectionDisplayText = () => {
        if (multiSelect) {
            if (selectedAssignees.length === 0) {
                return "Chưa có người được phân công"
            }
            return `${selectedAssignees.length} người được phân công`
        } else {
            return getSelectedAssigneeName()
        }
    }

    return (
        <>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <TouchableOpacity onPress={onBack} className="flex-row items-center" activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#3b82f6" />

                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800">
                    {multiSelect ? "Chọn nhiều người" : "Chọn người thực hiện"}
                </Text>
                <TouchableOpacity onPress={hideModal}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
            </View>

            {/* Current Selection Summary */}
            <View className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className="text-sm text-blue-600 font-medium mb-1">
                            {multiSelect ? "Đã chọn:" : "Người được phân công:"}
                        </Text>
                        <Text className="text-base text-blue-800 font-semibold">{getSelectionDisplayText()}</Text>
                        {multiSelect && maxSelections && (
                            <Text className="text-xs text-blue-600 mt-1">
                                Tối đa {maxSelections} người • Còn lại {maxSelections - selectedAssignees.length}
                            </Text>
                        )}
                    </View>
                    {multiSelect && selectedAssignees.length > 0 && clearAllAssignees && (
                        <TouchableOpacity onPress={clearAllAssignees} className="bg-red-100 rounded-lg px-3 py-2">
                            <Text className="text-red-600 text-sm font-medium">Xóa tất cả</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Selected Assignees Preview (Multi-select only) */}
                {multiSelect && selectedAssignees.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                        <View className="flex-row gap-2">
                            {selectedAssignees.slice(0, 5).map((assignee) => (
                                <View
                                    key={assignee.id}
                                    className="flex-row items-center bg-white rounded-full px-2 py-1 border border-blue-200"
                                >
                                    <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center mr-1">
                                        <Text className="text-xs font-medium text-white">
                                            {assignee.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .slice(0, 1)
                                                .toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text className="text-xs text-blue-800 font-medium" numberOfLines={1}>
                                        {assignee.name.split(" ").slice(-1)[0]}
                                    </Text>
                                    {removeAssignee && (
                                        <TouchableOpacity onPress={() => removeAssignee(assignee.id)} className="ml-1">
                                            <Ionicons name="close-circle" size={14} color="#6b7280" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                            {selectedAssignees.length > 5 && (
                                <View className="bg-white rounded-full px-2 py-1 border border-blue-200 items-center justify-center">
                                    <Text className="text-xs text-blue-600 font-medium">+{selectedAssignees.length - 5}</Text>
                                </View>
                            )}

                        </View>
                    </ScrollView>
                )}
            </View>

            {/* Search Bar */}
            {/* <View className="px-6 py-4 border-b border-gray-50">
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 ml-3 text-gray-800 text-base"
                        placeholder="Tìm kiếm nhân viên..."
                        placeholderTextColor="#9ca3af"
                        value={assigneeSearch}
                        onChangeText={setAssigneeSearch}
                        autoCapitalize="none"
                    />
                    {assigneeSearch !== "" && (
                        <TouchableOpacity onPress={clearAssigneeSearch} className="ml-2">
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>
            </View> */}

            {/* Content */}
            <ScrollView className="max-h-[30rem]" showsVerticalScrollIndicator={false}>
                {/* Unassigned Option (Single-select only) */}
                {!multiSelect && (
                    <TouchableOpacity
                        className={`flex-row items-center px-6 py-4 border-b border-gray-100 ${singleSelectedId === null ? "bg-blue-50" : "bg-white"
                            }`}
                        onPress={() => handleSelectAssignee(null)}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                                <Ionicons name="person-outline" size={20} color="#6b7280" />
                            </View>
                            <View className="flex-1">
                                <Text
                                    className={`text-base font-medium ${singleSelectedId === null ? "text-blue-700" : "text-gray-800"}`}
                                >
                                    Để trống người thực hiện
                                </Text>
                            </View>
                        </View>
                        {singleSelectedId === null && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />}
                    </TouchableOpacity>
                )}

                {/* Search Results or Department Hierarchy */}
                {assigneeSearch.trim() ? (
                    // Search Results
                    <View>
                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map((account) => renderAccount(account, true))
                        ) : (
                            <View className="items-center justify-center py-12">
                                <Ionicons name="search" size={48} color="#d1d5db" />
                                <Text className="text-gray-400 mt-4 text-center text-base">Không tìm thấy nhân viên</Text>
                                <Text className="text-gray-400 text-center text-sm mt-1">Thử tìm kiếm với từ khóa khác</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    // Department Hierarchy
                    <View>{assigneesData && assigneesData.map((department) => renderDepartment(department))}</View>
                )}
            </ScrollView>

            {/* Footer */}
            <View className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <Text className="text-xs text-gray-500 text-center">
                    {allAccounts.filter((acc) => acc.trangThai === 1).length} nhân viên khả dụng
                    {/* {multiSelect && ` • ${selectedAssignees.length} đã chọn`} */}
                </Text>
            </View>
            <View className="flex-row mt-4 justify-end items-end" >
                <TouchableOpacity onPress={onBack} className=" bg-blue-500 px-4 py-2 rounded-md" activeOpacity={0.7}>
                    <Text className="text-white  text-base font-medium  ">Hoàn tất</Text>
                </TouchableOpacity>
            </View>
        </>
    )
}

export default AssigneeSelectionView
