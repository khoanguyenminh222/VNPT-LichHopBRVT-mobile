const CustomLightTheme = {
    dark: false,
    colors: {
        primary: "rgb(0, 122, 255)",             // Màu xanh dương chính
        onPrimary: "rgb(255, 255, 255)",         // Màu trắng trên nền xanh dương
        primaryContainer: "rgb(200, 230, 255)",  // Nền nhạt hơn cho các thành phần chính
        onPrimaryContainer: "rgb(0, 50, 100)",   // Văn bản tối trên nền nhạt
        background: "rgb(255, 255, 255)",        // Nền trắng
        onBackground: "rgb(30, 30, 30)",         // Văn bản tối trên nền trắng
        surface: "rgb(245, 245, 245)",           // Màu xám nhạt cho các bề mặt
        onSurface: "rgb(30, 30, 30)",            // Văn bản tối trên bề mặt
        error: "rgb(255, 69, 58)",               // Màu đỏ cho lỗi
        onError: "rgb(255, 255, 255)",           // Văn bản trắng trên nền lỗi
        outline: "rgb(128, 128, 128)",           // Đường viền màu xám
        inverseSurface: "rgb(30, 30, 30)",       // Bề mặt tối cho chế độ đảo ngược
        inverseOnSurface: "rgb(245, 245, 245)",  // Văn bản sáng trên nền tối
        surfaceDisabled: "rgba(30, 30, 30, 0.12)",   // Màu bề mặt khi bị vô hiệu hóa
        onSurfaceDisabled: "rgba(30, 30, 30, 0.38)", // Văn bản vô hiệu hóa
        backdrop: "rgba(0, 0, 0, 0.4)",          // Nền mờ đen cho backdrop
        elevation: {
            level0: "transparent",
            level1: "rgb(245, 245, 245)",
            level2: "rgb(240, 240, 240)",
            level3: "rgb(235, 235, 235)",
            level4: "rgb(230, 230, 230)",
            level5: "rgb(225, 225, 225)"
        }
    }
};

export {
    CustomLightTheme
}