const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const getStartAndEndOfWeek = (offset) => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();

    // Nếu hôm nay là chủ nhật, điều chỉnh về thứ 2 của tuần trước.
    const diffToStartOfWeek = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

    // Thiết lập ngày cho ngày bắt đầu tuần (thứ 2)
    currentDate.setDate(diffToStartOfWeek + offset);  // offset có thể là 0 (tuần này) hoặc 7 (tuần sau)
    const startDate = new Date(currentDate);  // Ngày bắt đầu tuần

    // Tính ngày kết thúc tuần (thứ 7)
    const endDate = new Date(currentDate);
    endDate.setDate(startDate.getDate() + 6);  // Ngày cuối tuần là ngày thứ 7

    return { start: startDate, end: endDate };
};

export { formatDate, getStartAndEndOfWeek };