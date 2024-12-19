import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image, Platform } from "react-native";
import { Picker } from '@react-native-picker/picker';
import axios from "axios";

const ComplaintFakeScreen = () => {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    category: "Giao thông",
    description: "",
  });

  // Handle form changes
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Submit form data
  const handleSubmit = async () => {
    if (!form.fullName || !form.phoneNumber || !form.address || !form.description) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("phoneNumber", form.phoneNumber);
      formData.append("address", form.address);
      formData.append("category", form.category);
      formData.append("description", form.description);

      Alert.alert("Thành công", "Gửi khiếu nại thành công!");
      setForm({
        fullName: "",
        phoneNumber: "",
        address: "",
        category: "Giao thông",
        description: "",
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể gửi khiếu nại. Vui lòng thử lại sau.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gửi Khiếu Nại</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={form.fullName}
        onChangeText={(text) => handleChange("fullName", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        value={form.phoneNumber}
        onChangeText={(text) => handleChange("phoneNumber", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ"
        value={form.address}
        onChangeText={(text) => handleChange("address", text)}
      />
      
      <View className="border border-gray-300 rounded mb-4">
        <Picker
            selectedValue={form.category}
            onValueChange={(value) => handleChange("category", value)}
        >
            <Picker.Item label="Giao thông" value="Giao thông" />
            <Picker.Item label="Môi trường" value="Môi trường" />
            <Picker.Item label="An ninh" value="An ninh" />
            <Picker.Item label="Y tế" value="Y tế" />
        </Picker>
      </View>
      

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Nội dung khiếu nại"
        value={form.description}
        multiline
        onChangeText={(text) => handleChange("description", text)}
      />

      <Button title="Gửi khiếu nại" onPress={handleSubmit} color="#007BFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  imagePicker: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginBottom: 15,
    borderRadius: 5,
  },
});

export default ComplaintFakeScreen;
