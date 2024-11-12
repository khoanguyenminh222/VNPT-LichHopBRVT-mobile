
import Toast from 'react-native-toast-message';
import { accountRoute, cauHinhDonViNhanBaoCaoRoute, donViRoute, giaoBaoCaoRoute, kyBaoCaoRoute, nhapBaoCaoRoute } from '../api/baseURL';
import axiosInstance from './axiosInstance';
import axios from 'axios';


//hàm kiểm tra có được xem báo cáo trong url bắt đầu /admin/bao-cao
export const checkPermissionBaoCao = async (baoCaoId, userId, kyBaoCaoId) => {
    try {
        const responseKyBaoCao = await axiosInstance.get(kyBaoCaoRoute.findById+"/"+kyBaoCaoId);
        if(responseKyBaoCao.status >= 200 && responseKyBaoCao.status < 300) {
            // lấy ra thời gian hiện tại so sánh với thoiGianBatDau và thoiGianKetThuc
            const currentTime = new Date();
            const year = currentTime.getFullYear();
            const thoiGianBatDau = new Date(year + "-" + responseKyBaoCao.data.thoiGianBatDau);
            const thoiGianKetThuc = new Date(responseKyBaoCao.data.thoiGianKetThuc);

            if (currentTime < thoiGianBatDau) {
                Toast.show({
                    type: 'error',
                    text1: 'Báo cáo chưa mở',
                    position: 'top',
                    visibilityTime: 3000,
                });
                //window.history.back();
            }
        }

        const response = await axiosInstance.get(giaoBaoCaoRoute.findByBaoCaoId, {
            params: {
                baoCaoId: baoCaoId,
                kyBaoCaoId: kyBaoCaoId,
            }
        });
        if (response.status >= 200 && response.status < 300) {
            // debugger;
            const giaoBaoCaos = response.data;
            const hasPermission = giaoBaoCaos.some(giaoBaoCao => giaoBaoCao.nguoiNhapBaoCaoId === userId);
            if (!hasPermission) {
                Toast.show({
                    type: 'error',
                    text1: 'Không được quyền truy cập',
                    position: 'top',
                    visibilityTime: 3000,
                });
                //window.history.back();
            }
        }
    } catch (error) {
        console.log(error)
        const errorMessage = error.response ? error.response.data.message : error.message;
        console.log(errorMessage);
        Toast.show({
            type: 'error',
            text1: 'Không được quyền truy cập',
            position: 'top',
            visibilityTime: 3000,
        });
        //window.history.back();
    }
};
// hàm check báo cáo trong url bắt đầu /admin/don-vi-con-truc-thuoc
export const checkPermissionXemChiTietBaoCao = async (accountId, storedUser, baoCaoId, kyBaoCaoId, selectedYear) => {
    try {
        const responseKyBaoCao = await axiosInstance.get(kyBaoCaoRoute.findById+"/"+kyBaoCaoId);
        if(responseKyBaoCao.status >= 200 && responseKyBaoCao.status < 300) {
            // lấy ra thời gian hiện tại so sánh với thoiGianBatDau và thoiGianKetThuc
            const currentTime = new Date();
            currentTime.setFullYear(selectedYear);
            const thoiGianBatDau = new Date(selectedYear + "-" + responseKyBaoCao.data.thoiGianBatDau);
            const thoiGianKetThuc = new Date(responseKyBaoCao.data.thoiGianKetThuc);

            if (currentTime < thoiGianBatDau) {
                Toast.show({
                    type: 'error',
                    text1: 'Báo cáo chưa mở',
                    position: 'top',
                    visibilityTime: 3000,
                });
                //window.history.back();
            }
        }

        // Lấy danh sách tài khoản từ cauHinhDviNhanBaoCao
        const accountsFromCauHinh = await fetchCauHinhDviNhanBaoCao(storedUser.donViId);
        // lấy ra các id account
        const flattenedAccountIds = accountsFromCauHinh.map(acc => Number(acc.id));

        // Lấy danh sách tài khoản từ tất cả các đơn vị con
        const accountsFromAllDonVi = await fetchAccountsFromAllDonVi(storedUser);
        const allDonViAccountIds = accountsFromAllDonVi.map(acc => Number(acc.id));

        if(baoCaoId){
            const responseNhapBaoCao = await axiosInstance.get(nhapBaoCaoRoute.getNhapBaoCaoByBaoCaoIdAndAccountId, {
                params: {
                    baoCaoId: baoCaoId,
                    accountId: accountId,
                    kyBaoCaoId: kyBaoCaoId,
                    nam: selectedYear,
                }
            });
            if(responseNhapBaoCao.data.length===0){
                Toast.show({
                    type: 'error',
                    text1: 'Không được quyền truy cập',
                    position: 'top',
                    visibilityTime: 3000,
                });
                //console.log("check 1")
                //window.history.back();
            }
            let guiLenDonViCha = JSON.parse(responseNhapBaoCao.data[0].guiLenDonViCha)

            if(!((responseNhapBaoCao.data[0].trangThai === 'đã gửi' || responseNhapBaoCao.data[0].trangThai === 'xin đính chính' || responseNhapBaoCao.data[0].trangThai === 'từ chối') && (guiLenDonViCha.includes(storedUser.donViId) || flattenedAccountIds.includes(Number(accountId))) )){
                Toast.show({
                    type: 'error',
                    text1: 'Không được quyền truy cập',
                    position: 'top',
                    visibilityTime: 3000,
                });
                //console.log("check 2")
                //window.history.back();
            }
        }
        

        if(storedUser.vaiTro==='chuyenVien' ){
            Toast.show({
                type: 'error',
                text1: 'Không được quyền truy cập',
                position: 'top',
                visibilityTime: 3000,
            });
            //console.log("check 3")
            //window.history.back();
        }
            

        const response = await axiosInstance.get(accountRoute.findById+"/"+accountId);

        if (response.status >= 200 && response.status < 300) {
            const account = response.data;

            if(storedUser!=="admin"){
                //nếu account có cùng đơn vị hoặc account có trong cấu hình để gửi báo cáo
                if(!(account.donViId==storedUser.donViId || flattenedAccountIds.includes(Number(accountId)) || allDonViAccountIds.includes(Number(accountId)))){
                    Toast.show({
                        type: 'error',
                        text1: 'Không được quyền truy cập',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                    //console.log("check 4")
                    //window.history.back();
                }   
            }
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        console.log(errorMessage);
    }
};
// hàm fetch ra các account từ cấu hình đon vị nhận báo cáo
export const fetchCauHinhDviNhanBaoCao = async (donViId) => {
    try {
        const response = await axiosInstance.get(cauHinhDonViNhanBaoCaoRoute.findByDonViNhanId + "/" + donViId);
        if (response.status >= 200 && response.status < 300) {
            const cauHinhData = response.data; // chỗ này sẽ ra các đơn vị

            const accountsFromCauHinh = await Promise.all(cauHinhData.map(async (ac) => {
                // lấy ra account theo đơn vị
                const responseAccounts = await axiosInstance.get(accountRoute.findSameDonVi + "/" + ac.donViGuiBaoCaoId);

                // tìm theo đơn vị để lấy tên đơn vị
                const responseDonVi = await axiosInstance.get(donViRoute.findById + "/" + ac.donViGuiBaoCaoId);

                // lấy ra đơn vị nhận báo cáo
                const donViNhanBaoCao = await axiosInstance.get(donViRoute.findById+ "/" + donViId);
                const accounts = await Promise.all(
                    responseAccounts.data.map(async (account) => {
                        // Gọi API giaoBaoCao cho từng account
                        const responseGiaoBaoCao = await axiosInstance.get(giaoBaoCaoRoute.findByNguoiNhapId + "/" + account.id);
                        
                        // Trả về account với dữ liệu bổ sung từ responseDonVi và responseGiaoBaoCao
                        return {
                            ...account,
                            donVi: responseDonVi.data, // Thêm dữ liệu đơn vị
                            donViNhan: donViNhanBaoCao.data, // Thêm dữ liệu đơn vị nhận
                            giaoBaoCao: responseGiaoBaoCao.data // Thêm dữ liệu giao báo cáo
                        };
                    })
                );
                return accounts;
            }));
            const flattenedAccounts = accountsFromCauHinh.flat(); // làm phẳng mảng
            return flattenedAccounts;
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        console.log(errorMessage);
    }
    return [];
};
// hàm fetch ra tất cả account theo đơn vị cha Ví dụ: từ các đơn vị Tỉnh -> huyện -> xã -> phòng
export const fetchAccountsFromAllDonVi = async (storedUser) => {
    try {
        // lấy đơn vị theo idCha
        const response = await axiosInstance.get(donViRoute.findByIdCha + "/" + storedUser.donViId)
        if (response.status >= 200 && response.status < 300) {

            const donVis = response.data;
            const updatedDonVis = await Promise.all(donVis.map(async (donVi) => {
                // lấy ra account theo đơn vị
                const responseAccounts = await axiosInstance.get(accountRoute.findSameDonVi + "/" + donVi.id);
                const accountData = responseAccounts.data;
                // gọi hàm để lấy ra các account và account có cấu hình đơn vị gửi báo cáo
                const combinedData = await Promise.all(accountData.map(async (ac) => await fetchCombinedData(ac, false)));
                return combinedData.flat();
            }));
           
            // Loại bỏ các tài khoản trùng lặp (dựa trên id tài khoản)
            const uniqueData = updatedDonVis.flat().filter((item, index, self) =>
                index === self.findIndex((t) => (
                    t.id === item.id
                ))
            );
            return uniqueData;
            
        }
        return [];
    } catch (error) {
        const errorMessage = error.response?.data?.message ? error.response.data.message : error.message;
        console.log(errorMessage);
        return [];
    }
}

// fetch ra acocunt có cùng đơn vị và các cấu hình đơn vị nhận báo cáo theo user đó
// với flag==true thì sẽ tích hợp hiển thị fetchCauHinhDviNhanBaoCao
// flag == false thì không tích hợp fetchCauHinhDviNhanBaoCao
export const fetchCombinedData = async (user, isCauHinhDonViNhanBaoCao) => {
    if (!user) return [];

    const fetchDonVi = async () => {
        try {
            const response = await axiosInstance.get(accountRoute.findSameDonVi + "/" + user.donViId);
            if (response.status >= 200 && response.status < 300) {
                const accounts = response.data;
                const updatedAccounts = await Promise.all(accounts.map(async (a) => {
                    const responseDonVi = await axiosInstance.get(donViRoute.findById + "/" + a.donViId);
                    const responseGiaoBaoCao = await axiosInstance.get(giaoBaoCaoRoute.findByNguoiNhapId+"/"+a.id)
                    
                    return { ...a, donVi: responseDonVi.data, giaoBaoCao: responseGiaoBaoCao.data };
                }));
                return updatedAccounts;
            }
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : error.message;
            console.log(errorMessage);
            return [];
        }
    };

    try {
        let combinedData;
        const [donViData, cauHinhData] = await Promise.all([fetchDonVi(), fetchCauHinhDviNhanBaoCao(user.donViId)]);
        if(isCauHinhDonViNhanBaoCao){
            combinedData = [...donViData, ...cauHinhData];
        } else {
            combinedData = [...donViData];
        }
        

        // Loại bỏ các tài khoản trùng lặp (dựa trên id tài khoản)
        const uniqueData = combinedData.filter((item, index, self) =>
            index === self.findIndex((t) => (
                t.id === item.id
            ))
        );
        
        return uniqueData;
    } catch (error) {
        console.log('Error fetching combined data:', error);
        return [];
    }
};