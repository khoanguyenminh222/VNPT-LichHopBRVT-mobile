import { create } from 'zustand'

//Tạo store lưu giá trị viewmode mặc định là 1 (dạng tuần), 2 (dạng ngày)
export const useViewModeStore = create((set) => ({
    viewMode: 1,    //Set giá trị mặc định là view 1 (dạng tuần)
    setViewMode: (newMode) => set({ viewMode: newMode }),
}))