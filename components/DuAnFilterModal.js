"use client"

import React, { useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native'
import { Modal } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'

const { height } = Dimensions.get('window')




const DuAnFilterModal = ({
    visible,
    onDismiss,
    projects,
    selectedProjectId,
    onSelectProject
}) => {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects || []

        return (projects || []).filter(project =>
            project.tenDuAn.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [projects, searchQuery])

    const handleSelectProject = (projectId) => {
        onSelectProject(projectId)
        setSearchQuery('')
        onDismiss()
    }

    const clearSearch = () => {
        setSearchQuery('')
    }

 
    return (
        <Modal
            visible={visible}
            onDismiss={onDismiss}
            contentContainerStyle={{
                backgroundColor: 'white',
                margin: 20,
                borderRadius: 20,
                maxHeight: height * 0.8,
                overflow: 'hidden',
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
            }}
        >
            <View style={{ maxHeight: height * 0.8 }}>
                {/* Header */}
                <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
                    <Text className="text-xl font-bold text-gray-800">Chọn dự án</Text>
                    <TouchableOpacity
                        onPress={onDismiss}
                        className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                    >
                        <Ionicons name="close" size={20} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="px-6 border-b border-gray-50">
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 ">
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-800 text-base"
                            placeholder="Tìm kiếm dự án..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                        />
                        {searchQuery !== '' && (
                            <TouchableOpacity onPress={clearSearch} className="ml-2">
                                <Ionicons name="close-circle" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                {/* Project List */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* All Projects Option */}
                    <TouchableOpacity
                        className={`flex-row items-center px-6 py-4 border-b border-gray-50 ${selectedProjectId === null ? 'bg-blue-50' : 'bg-white'
                            }`}
                        onPress={() => handleSelectProject(null)}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center flex-1">
                            <View
                                className={`w-4 h-4 rounded-full mr-4 ${selectedProjectId === null ? 'bg-blue-500' : 'bg-gray-200'
                                    }`}
                            >
                                <View className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                            </View>
                            <View className="flex-1">
                                <Text
                                    className={`text-base font-medium ${selectedProjectId === null ? 'text-blue-700' : 'text-gray-800'
                                        }`}
                                >
                                    Tất cả dự án
                                </Text>
                                <Text className="text-sm text-gray-500 mt-1">
                                    Hiển thị nhiệm vụ từ tất cả dự án
                                </Text>
                            </View>
                        </View>
                        {selectedProjectId === null && (
                            <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                        )}
                    </TouchableOpacity>


                    {filteredProjects && filteredProjects.map((project, index) => (
                        <TouchableOpacity
                            key={index}
                            className={`flex-row items-center px-6 py-4 ${selectedProjectId === project.id ? 'bg-blue-50' : 'bg-white'}`}
                            onPress={() => handleSelectProject(project.id)}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center flex-1">
                                <View
                                    className={`w-4 h-4 rounded-full mr-4`}
                                    style={{ backgroundColor: '#6b7280' }}
                                />
                                <View className="flex-1">
                                    <Text
                                        className={`text-base font-medium ${selectedProjectId === project.id ? 'text-blue-700' : 'text-gray-800'}`}
                                        numberOfLines={2}
                                    >
                                        {project?.tenDuAn}
                                    </Text>
                                </View>
                            </View>
                            {selectedProjectId === project.id && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />}
                        </TouchableOpacity>
                    ))
                    }
                </ScrollView>

                {/* Footer */}
                <View className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <Text className="text-xs text-gray-500 text-center">
                        {filteredProjects.length} dự án khả dụng
                    </Text>
                </View>
            </View>
        </Modal>
    )
}

export default DuAnFilterModal
