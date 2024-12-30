import React, { useContext, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
} from "react-native";
import { FakeIOSContext } from '../../context/FakeIOSContext';

const articles = [
    {
        id: 1,
        title: "Vinaphone chính thức phủ sóng 5G trên cả nước",
        image: "https://scontent.fhan4-6.fna.fbcdn.net/v/t39.30808-6/470231999_981922260625349_8095651155625154935_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_ohc=f3zopowb1roQ7kNvgGVgxg7&_nc_oc=Adi8i5Ebe2bpOmq2AUyIeDCvGTOys6iDk5aGDn0C5_lhTzqz9chOF6MdxE_mpiZ9QF0&_nc_zt=23&_nc_ht=scontent.fhan4-6.fna&_nc_gid=Ajtpxs6uYAeaKtuxsPqvEeP&oh=00_AYA1tFJi00zNS_OQjlRQnA77tuo3_N9C_vdhS_ZBfU9psA&oe=67717C0D",
        date: "20/12/2024",
        content:
            "Vinaphone 5G hoạt động trên băng tần ưu việt 3.700 – 3.800 MHz với lợi thế băng thông lớn, độ trễ cực thấp, mang đến tốc độ internet tối ưu, tốc độ thương mại thực tế có thể lên đến 1,5 Gbps, gấp 10-20 lần 4G.",
    },
    {
        id: 2,
        title: "VNPT nâng tốc độ Internet hơn 3 lần – giá không đổi, thúc đẩy kiến tạo “cuộc sống số”",
        image: "https://bariavungtau.vnpt.vn/upload/news/files/2024/img_vm_2412171350439035.jpg",
        date: "23-12-2024",
        content:
            "Tốc độ Internet mới của VNPT sẽ được nâng lên tối thiểu 200Mbps, áp dụng với khách hàng đang sử dụng các gói cước từ 100Mbps trở xuống, tương ứng mức tăng trên 100%. Khách hàng sử dụng gói cước từ trên 100Mbps tới 150Mbps và từ trên 150Mbps đến 200Mbps sẽ được tăng lên khoảng 3 lần, lần lượt lên các mốc 300Mbps và 500Mbps. Riêng nhóm khách hàng có gói cước từ trên 200Mbps sẽ được tăng tới 5 lần với tốc độ mới đạt đến 1Gbps.",
    },
    {
        id: 3,
        title: "Khách hàng VNPT, VinaPhone đón Tết linh đình với kho quà gần 5,6 tỷ đồng",
        image: "https://capquangvnpt24h.com/files/assets/vnpt-ba-ria-vung-tau_1_1.webp",
        date: "04-12-2024",
        content:
            "Chỉ với 20.000đ nạp thẻ, đăng ký, gia hạn gói cước Di động VinaPhone hoặc Internet VNPT, khách hàng sẽ có ngay cơ hội trúng iPhone 16 Pro Max, iPhone 16 cùng hàng ngàn quà tặng giá trị trong siêu khuyến mại mùa Tết của nhà mạng.",
    },
    {
        id: 4,
        title: "Giá xăng giảm mạnh trong tháng 12",
        image: "https://file3.qdnd.vn/data/images/0/2024/12/13/upload_1028/oil-reuters-7.jpg",
        date: "13/12/2024",
        content:
            "Bộ Công Thương cho biết giá xăng dầu trong nước sẽ giảm mạnh vào cuối tháng 12, giúp giảm áp lực chi tiêu cho người dân.",
    },
    {
        id: 5,
        title: "Xuất khẩu gạo Việt Nam đạt kỷ lục",
        image: "https://file3.qdnd.vn/data/images/0/2024/12/08/upload_2080/xuat%20khau%20gao.jpg",
        date: "12/12/2024",
        content:
            "Năm 2024 ghi nhận kỷ lục mới về xuất khẩu gạo của Việt Nam, đạt 10 triệu tấn, mang lại giá trị kinh tế cao nhất từ trước đến nay.",
    },
    {
        id: 6,
        title: "Cảnh báo thời tiết lạnh tại miền Bắc",
        image: "https://photo-baomoi.bmcdn.me/w700_r1/2024_12_17_296_51006314/10969c3676799f27c668.jpg.webp",
        date: "11/12/2024",
        content:
            "Trung tâm Dự báo Khí tượng Thủy văn cho biết miền Bắc sẽ đón đợt lạnh kèm mưa nhỏ trong những ngày tới, nhiệt độ giảm sâu dưới 10 độ C.",
    },
    {
        id: 7,
        title: "Lãi suất ngân hàng có xu hướng giảm",
        image: "https://imagev3.vietnamplus.vn/w1000/Uploaded/2024/znaets/2024_07_30/vnp-vnd3-5885.jpg.webp",
        date: "10/12/2024",
        content:
            "Ngân hàng Nhà nước vừa công bố giảm lãi suất cơ bản, mang lại cơ hội vay vốn dễ dàng hơn cho doanh nghiệp và người dân.",
    },
    {
        id: 8,
        title: "Du lịch Việt Nam bùng nổ cuối năm",
        image: "https://cdn-images.vtv.vn/thumb_w/1200/66349b6076cb4dee98746cf1/2024/11/23/du-thuyen-vinh-ha-long1---tripmap-manh--1--90984899018510987717481-07852717773882012274755.jpg",
        date: "09/12/2024",
        content:
            "Ngành du lịch Việt Nam ghi nhận sự tăng trưởng mạnh vào dịp cuối năm, đặc biệt là các điểm đến như Đà Nẵng, Phú Quốc và Sapa.",
    },
    {
        id: 9,
        title: "Cầu thủ Việt Nam ghi bàn thắng lịch sử",
        image: "https://library.sportingnews.com/styles/crop_style_16_9_desktop_webp/s3/2023-01/IMG_6171.JPG.webp",
        date: "08/12/2024",
        content:
            "Trong trận đấu kịch tính, đội tuyển bóng đá Việt Nam đã giành chiến thắng nhờ bàn thắng lịch sử của cầu thủ trẻ Nguyễn Văn A.",
    },
    {
        id: 10,
        title: "Phát hiện mới về di tích cổ tại Quảng Nam",
        image: "https://images.vietnamtourism.gov.vn/vn//images/2024/thang_4/1004.duong_co_my_son_2.jpg",
        date: "07/12/2024",
        content:
            "Các nhà khảo cổ vừa phát hiện một di tích cổ quan trọng tại Quảng Nam, làm sáng tỏ thêm nhiều thông tin về nền văn hóa Chăm Pa.",
    },
];

const LichHopFakeScreen = () => {
    const { isDarkMode, fontSize } = useContext(FakeIOSContext);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const renderArticleItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => setSelectedArticle(item)}
            style={[
                styles.articleItem,
                { backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" },
            ]}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.articleImage}
                resizeMode="cover"
            />
            <View style={styles.articleContent}>
                <Text
                    style={[
                        styles.articleTitle,
                        { color: isDarkMode ? "#fff" : "#000", fontSize },
                    ]}
                >
                    {item.title}
                </Text>
                <Text
                    style={[
                        styles.articleDate,
                        { color: isDarkMode ? "#ccc" : "#555", fontSize: fontSize - 2 },
                    ]}
                >
                    {item.date}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (selectedArticle) {
        return (
            <ScrollView
                style={[
                    styles.articleDetail,
                    { backgroundColor: isDarkMode ? "#121212" : "#f9f9f9" },
                    Platform.OS === "android" && { marginTop: 25 },
                ]}
            >
                <Image
                    source={{ uri: selectedArticle.image }}
                    style={styles.articleDetailImage}
                    resizeMode="cover"
                />
                <Text
                    style={[
                        styles.articleDetailTitle,
                        { color: isDarkMode ? "#fff" : "#000", fontSize },
                    ]}
                >
                    {selectedArticle.title}
                </Text>
                <Text
                    style={[
                        styles.articleDetailDate,
                        { color: isDarkMode ? "#ccc" : "#555", fontSize: fontSize - 2 },
                    ]}
                >
                    {selectedArticle.date}
                </Text>
                <Text
                    style={[
                        styles.articleDetailContent,
                        { color: isDarkMode ? "#ccc" : "#000", fontSize: fontSize - 1 },
                    ]}
                >
                    {selectedArticle.content}
                </Text>
                <TouchableOpacity
                    onPress={() => setSelectedArticle(null)}
                    style={[
                        styles.backButton,
                        { backgroundColor: isDarkMode ? "#4f46e5" : "#2563eb" },
                    ]}
                >
                    <Text style={{ color: "#fff", fontSize }}>Quay lại</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: isDarkMode ? "#121212" : "#f9f9f9",
                    marginTop: 25
                },
            ]}
        >
            <FlatList
                data={articles}
                renderItem={renderArticleItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.articleList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    articleList: {
        padding: 10,
    },
    articleItem: {
        marginBottom: 15,
        borderRadius: 10,
        overflow: "hidden",
        elevation: 2,
    },
    articleImage: {
        width: "100%",
        height: 200,
    },
    articleContent: {
        padding: 10,
    },
    articleTitle: {
        fontWeight: "bold",
    },
    articleDate: {
        marginTop: 5,
    },
    articleDetail: {
        flex: 1,
        padding: 10,
        marginTop: 25,
    },
    articleDetailImage: {
        width: "100%",
        height: 250,
        marginBottom: 15,
        borderRadius: 10,
    },
    articleDetailTitle: {
        fontWeight: "bold",
        marginBottom: 10,
    },
    articleDetailDate: {
        marginBottom: 10,
    },
    articleDetailContent: {
        lineHeight: 22,
    },
    backButton: {
        marginTop: 20,
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
});

export default LichHopFakeScreen;
