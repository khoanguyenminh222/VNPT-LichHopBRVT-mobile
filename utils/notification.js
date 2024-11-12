import { tienIchThongBaoRoute } from "../api/baseURL";
import axiosInstance from "./axiosInstance";

export const handleCreateThongBao = async (tienIchThongBao) => {
    try {
        await axiosInstance.post(tienIchThongBaoRoute.create, tienIchThongBao);
    } catch (error) {
        console.log(error);
    }
}

export const handleSendMailAndSms = async (tienIchThongBao) => {
    try {
        await axiosInstance.post(tienIchThongBaoRoute.sendMailAndSms, tienIchThongBao);
    } catch (error) {
        console.log(error);
    }
}