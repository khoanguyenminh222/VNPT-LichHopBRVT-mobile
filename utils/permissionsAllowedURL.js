function hasAccess(currentUrl, userAllowedUrls) {
    // Kiểm tra xem URL hiện tại có nằm trong danh sách URL người dùng được phép truy cập hay không
    return userAllowedUrls.includes(currentUrl);
}

export default hasAccess;