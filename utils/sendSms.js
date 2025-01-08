import React from 'react'
import axiosInstance from './axiosInstance'
import { accountRoute, sendSMSRoute } from "../api/baseURL";
import Toast from 'react-native-toast-message';

const sendSms = async ({ 
    accountDuyetLich = null, // Default to null
    noiDungSms = "Default SMS content", // Default message
    smsType = 1, // Default type is 1
    accountId = null, // Default to null
    storedUser = null, // Default to null
}) => {
    const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + accountId);                  // Lấy thông tin tài khoản từ API theo accountId
    const phoneNum = responseAccount?.data?.phone; // Lấy sđt từ thông tin tài khoản

    if (smsType) {
        switch (smsType) {
            case 1: //Đăng ký
                if (Array.isArray(accountDuyetLich) && accountDuyetLich.length > 0) {
                    accountDuyetLich.map(async (id) => {
                        const responseAccount = await axiosInstance.get(accountRoute.findById + "/" + id);
                        const account = responseAccount.data;

                        // Nếu account.phone null thì bỏ qua
                        if (!account.phone) {
                            return;
                        }
                        //console.log(removeAccents(data.noiDungCuocHop))
                        // Gửi SMS cho tài khoản này
                        try {
                            console.log("gửi sms", account.phone);
                            console.log("route:", sendSMSRoute.sendSMS);
                            await axiosInstance.post(sendSMSRoute.sendSMS, {
                                phonenumber: account.phone,
                                content: noiDungSms,
                            });
                        } catch (error) {
                            // Nếu có lỗi trong quá trình gửi SMS
                            Toast.show({
                                type: 'error',
                                text1: 'Gửi SMS thất bại cho ' + account.phone,
                                position: 'top',
                                visibilityTime: 3000,
                            });
                        }
                    });
                }
                break;
            case 2: //Huỷ lịch
                if (!phoneNum) return;
                if (accountId != storedUser.id) {
                    console.log("gửi sms");
                    await axiosInstance.post(sendSMSRoute.sendSMS, {
                        phonenumber: phoneNum,
                        content: noiDungSms
                    });
                }
            case 3: //Duyệt lịch
                if (!phoneNum) return;
                // Gửi SMS;
                if (accountId != storedUser.id) {
                    console.log("gửi sms");
                    await axiosInstance.post(sendSMSRoute.sendSMS, {
                        phonenumber: phoneNum,
                        content: noiDungSms
                    });
                }
            case 4: //Xoá lịch
                if (accountId != storedUser.id) {
                    console.log("gửi sms");
                    await axiosInstance.post(sendSMSRoute.sendSMS, {
                        phonenumber: phoneNum,
                        content: noiDungSms
                    });
                }
            default:
                break;
        }

    }
}

export default sendSms