"use client"

import React, { useState } from "react"
import { View, Dimensions } from "react-native"
import { Modal } from "react-native-paper"
import TaskFormView from "./../components/TaskFormView"
import AssigneeSelectionView from "./../components/AssigneeSelectionView"

const { height } = Dimensions.get("window")

const CreateOrUpdateTaskModal = ({
    isModalVisible,
    hideModal,
    editingTask,
    setEditingTask,
    handleSaveTask,
    projects,
    errors,
    setErrors,
    isDatePickerVisible,
    setIsDatePickerVisible,
    selectedProject,
    setSelectedProject,
    action,
    assigneesData,
    multiSelect = true, // New prop to enable multi-select mode
    maxSelections = null, // Optional limit on selections
}) => {
    const [search, setSearch] = useState("")
    const [currentView, setCurrentView] = useState("taskForm") // "taskForm" or "assigneeSelection"

    // Flatten all accounts for getting selected assignee names
    const allAccounts = React.useMemo(() => {
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

    // Single-select: Get selected assignee name
    const getSelectedAssigneeName = () => {
        if (multiSelect) return ""
        if (!editingTask?.assignees) return "Chưa phân công"
        const selectedAccount = allAccounts.find((acc) => acc.id === editingTask.assignees)
        return selectedAccount?.name || "Không xác định"
    }

    // Trả về danh sách tên của các assignee đã chọn trong chế độ multi-select
    const getSelectedAssigneeNames = () => {
        if (!multiSelect) return []
        const assigneeIds = editingTask?.assignee_ids || []
        return allAccounts
            .filter((account) => assigneeIds.includes(account.id))
            .map((account) => ({ id: account.id, name: account.name }))
    }

    const handleSelectAssignee = (assigneeId) => {
        if (multiSelect) {
            // Ensure currentAssignees is an array, even if it's a string or undefined
            let currentAssignees = editingTask?.assignee_ids || []
            console.log("Current assignees before selection:", currentAssignees)
            console.log("Selected assignee ID:", assigneeId)

            if (typeof currentAssignees === "string") {
                currentAssignees = currentAssignees.split(",") // Convert string to array
            }

            // Remove duplicates by converting array to a Set
            currentAssignees = [...new Set(currentAssignees)];

            let newAssignees

            if (currentAssignees.includes(String(assigneeId))) {
                // Remove assignee if already selected
                newAssignees = currentAssignees.filter((id) => id !== String(assigneeId))
            } else {
                // Add assignee if not selected (check max limit)
                if (maxSelections && currentAssignees.length >= maxSelections) {
                    return // Don't add if at max limit
                }
                newAssignees = [...currentAssignees, String(assigneeId)]
            }

            // Join back into a string before saving
            const parsedAssignees = newAssignees.join(',')
            setEditingTask({ ...editingTask, assignee_ids: parsedAssignees })
        } else {
            // Single-select mode: set single assignee and go back
            setEditingTask({ ...editingTask, assignee_ids: assigneeId })
            setCurrentView("taskForm")
        }
    }



    const removeAssignee = (assigneeId) => {
        if (!multiSelect) return
        console.log("Removing assignee:", assigneeId)
        const currentAssignees = editingTask?.assignee_ids || []
        const newAssignees = currentAssignees.filter((id) => id !== assigneeId)
        setEditingTask({ ...editingTask, assignee_ids: newAssignees })
    }

    const clearAllAssignees = () => {
        if (!multiSelect) return
        setEditingTask({ ...editingTask, assignee_ids: [] })
    }

    const handleModalHide = () => {
        setCurrentView("taskForm")
        hideModal()
    }

    return (
        <Modal
            visible={isModalVisible}
            onDismiss={currentView === "taskForm" ? handleModalHide : undefined}
            contentContainerStyle={{
                backgroundColor: "white",
                margin: 20,
                borderRadius: 16,
                maxHeight: height * 0.9,
            }}
        >
            <View className="p-6">
                {currentView === "taskForm" ? (
                    <TaskFormView
                        action={action}
                        editingTask={editingTask}
                        setEditingTask={setEditingTask}
                        hideModal={handleModalHide}
                        handleSaveTask={handleSaveTask}
                        projects={projects}
                        errors={errors}
                        setErrors={setErrors}
                        isDatePickerVisible={isDatePickerVisible}
                        setIsDatePickerVisible={setIsDatePickerVisible}
                        selectedProject={selectedProject}
                        setSelectedProject={setSelectedProject}
                        search={search}
                        setSearch={setSearch}
                        onSelectAssignee={() => setCurrentView("assigneeSelection")}
                        getSelectedAssigneeName={getSelectedAssigneeName}
                        getSelectedAssigneeNames={getSelectedAssigneeNames}
                        removeAssignee={removeAssignee}
                        multiSelect={multiSelect}
                    />
                ) : (
                    <AssigneeSelectionView
                        assigneesData={assigneesData}
                        editingTask={editingTask}
                        onSelectAssignee={handleSelectAssignee}
                        onBack={() => setCurrentView("taskForm")}
                        hideModal={handleModalHide}
                        getSelectedAssigneeName={getSelectedAssigneeName}
                        getSelectedAssigneeNames={getSelectedAssigneeNames}
                        clearAllAssignees={clearAllAssignees}
                        removeAssignee={removeAssignee}
                        multiSelect={multiSelect}
                        maxSelections={maxSelections}
                    />
                )}
            </View>
        </Modal>
    )
}

export default CreateOrUpdateTaskModal
