import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "react-native-paper";
import React, { useState } from "react";

const SearchInputComponent = ({
    value,
    onChangeText,
    placeholder,
    clearSearchText,
    containerStyle,
    style,
    iconSize = 20,
    iconColor = '#888',
    ...rest
}) => {


    return (
        <View style={[styles.container, containerStyle]}>
            <View style={{ height: "100%", width: 50, justifyContent: "center", flexDirection: "row", alignItems: "center",borderRightWidth: 1  , borderRightColor: "#ccc" }}>
                <Ionicons name="search" size={iconSize} color={iconColor} />
            </View>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                style={[styles.input, style]}
                theme={{ colors: { primary: 'transparent' } }}
                placeholderTextColor="#999"
                {...rest}  // Spreading any other remaining props
            />
            {value ? (
                <TouchableOpacity onPress={clearSearchText} style={{ padding: 8 }}>
                    <Ionicons name="close-circle" size={iconSize} color={iconColor} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export default SearchInputComponent;
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: 40,
        backgroundColor: 'white'
    },

});