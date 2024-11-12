let domain = process.env.domain;
let publicfolder = domain+"/uploads"
const authRoute = {
    login: `${domain}/api/auth/login`,
    resetPassword: `${domain}/api/auth/resetPassword`,
    casbrvtlogin: `${domain}/api/auth/casbrvtlogin`,
};

const tokenRoute = {
    refreshToken: `${domain}/api/token`,
    deleteToken: `${domain}/api/token`,
}

const thongKeDangNhapSaiRoute = {
    findByUserName: `${domain}/api/thongKeDangNhapSai`, // /:username
    create: `${domain}/api/thongKeDangNhapSai`, // body thongKeDangNhapSai
    update: `${domain}/api/thongKeDangNhapSai`, // /:id, body thongKeDangNhapSai
    delete: `${domain}/api/thongKeDangNhapSai`, // /:id
}

const accountRoute = {
    findAll: `${domain}/api/admin/account/findAll`,
    findById: `${domain}/api/admin/account`, // /:id 
    findByUsername: `${domain}/api/admin/account/username`, // /:username 
    findSameDonVi: `${domain}/api/admin/account/donViId`, // /:donViId
    create: `${domain}/api/admin/account`,
    update: `${domain}/api/admin/account`, // /:id
    delete: `${domain}/api/admin/account`, // /:id
};

const nhomChucNangRoute = {
    findAll: `${domain}/api/admin/nhomChucNang`,
    create: `${domain}/api/admin/nhomChucNang`,
    update: `${domain}/api/admin/nhomChucNang`, // /:id body là nhomChucNang
    delete: `${domain}/api/admin/nhomChucNang`, // /:id
};

const chucNangRoute = {
    findAll: `${domain}/api/admin/chucNang`,
    findById: `${domain}/api/admin/chucNang`, // /:id
    create: `${domain}/api/admin/chucNang`,
    edit: `${domain}/api/admin/chucNang`, // /:id body là chucNang
    delete: `${domain}/api/admin/chucNang`, // /:id
};

const chiTieuRoute = {
    findAll: `${domain}/api/admin/chiTieu`,
    findById: `${domain}/api/admin/chiTieu`, // /:id
    create: `${domain}/api/admin/chiTieu`,
    edit: `${domain}/api/admin/chiTieu`, // /:id body là chiTieu
    delete: `${domain}/api/admin/chiTieu`, // /:id
    findDSChiTieuByNhomChiTieuId: `${domain}/api/admin/chiTieu/findDSChiTieuByNhomChiTieuId`, // /:nhomChiTieuId
};

const nhomChiTieuRoute = {
    findAll: `${domain}/api/admin/nhomChiTieu`,
    findById: `${domain}/api/admin/nhomChiTieu`, // /:id
    create: `${domain}/api/admin/nhomChiTieu`,
    edit: `${domain}/api/admin/nhomChiTieu`, // /:id body là nhomChiTieu
    delete: `${domain}/api/admin/nhomChiTieu`, // /:id
};

const chiTietNhomChucNangRoute = {
    getChucNangsByNhomChucNang: `${domain}/api/admin/chiTietNhomChucNang`, // truyền query nhomChucNangId ?nhomChucNangId=
    saveChucNangsForNhomChucNang: `${domain}/api/admin/chiTietNhomChucNang`,
};

const donViRoute = {
    findAll: `${domain}/api/admin/donVi`,
    findById: `${domain}/api/admin/donVi`, // /:id
    create: `${domain}/api/admin/donVi`,
    edit: `${domain}/api/admin/donVi`, // /:id body là donVi
    delete: `${domain}/api/admin/donVi`, // /:id
    findByIdCha: `${domain}/api/admin/donVi/idCha`, // /:idCha
};



const phanQuyenRoute = {
    getNhomChucNangByAccountId: `${domain}/api/admin/phanQuyen/nhomChucNang`, // truyền query accountId ?accountId=
    getChucNangByAccountId: `${domain}/api/admin/phanQuyen/chucNang`, // truyền query accountId ?accountId=
    savePhanQuyenForAccount: `${domain}/api/admin/phanQuyen`,
};

const cotBaoCaoRoute = {
    getCotBaoCao: `${domain}/api/admin/cotBaoCao`, // truyền query baoCaoId ?baoCaoId=
    addCotBaoCao: `${domain}/api/admin/cotBaoCao`,
    updateCotBaoCao: `${domain}/api/admin/cotBaoCao`, // /:id
    deleteCotBaoCao: `${domain}/api/admin/cotBaoCao`, // /:id
    getCotCha: `${domain}/api/admin/cotBaoCao/cotCha`, // /:idCotCha
    getAllCotBaoCaoDeGanChiTieu: `${domain}/api/admin/getAllCotBaoCaoDeGanChiTieu`, // truyền query baoCaoId ?baoCaoId=
};

const nhapBaoCaoRoute = {
    getNhapBaoCaoByBaoCaoIdAndAccountId: `${domain}/api/admin/nhapBaoCao`, // truyền query baoCaoId ?baoCaoId=&accountId?
    saveNhapBaoCao: `${domain}/api/admin/nhapBaoCao`,
    saveChiTieuVaoBaoCao: `${domain}/api/admin/nhapBaoCao/saveChiTieuVaoBaoCao`,
    deleteByBaoCaoIdAccountIdKyBaoCaoId: `${domain}/api/admin/nhapBaoCao`, // /truyền query baoCaoId ?baoCaoId=&accountId?
    deleteByBaoCaoIdAccountId: `${domain}/api/admin/nhapBaoCao/deleteByBaoCaoIdAccountId`, // /truyền query baoCaoId ?baoCaoId=&accountId?
    updateTrangThai: `${domain}/api/admin/nhapBaoCao`, // body: trangThai(báo cáo đã giao, đã nhập, đã gửi, xin đính chính, đang chỉnh sửa, báo cáo bị trả về), baoCaoId, accountId, xinSuaDuLieu
    updateGuiLenDonViCha: `${domain}/api/admin/nhapBaoCao/guiLenDonViCha`, // body: guiLenDonViCha, accountId, baoCaoId
    updateSauKhiGanChiTieuVaGiaoBaoCao: `${domain}/api/admin/nhapBaoCao/updateSauKhiGanChiTieuVaGiaoBaoCao`, // body: accountId, kyBaoCaoId, baoCaoId
    getByBaoCaoId: `${domain}/api/admin/nhapBaoCao/getByBaoCaoId`, // query: baoCaoId
    getByAccountId: `${domain}/api/admin/nhapBaoCao/getByAccountId`, // query: accountId
};

const baoCaoRoute = {
    findAll: `${domain}/api/admin/baoCao`,
    findActiveAll: `${domain}/api/admin/baoCaoActive`,
    findById: `${domain}/api/admin/baoCao`, // /:id
    create: `${domain}/api/admin/baoCao`,
    edit: `${domain}/api/admin/baoCao`, // /:id body là baoCao
    delete: `${domain}/api/admin/baoCao`, // /:id
    updateTrangThai: `${domain}/api/admin/baoCao/updateTrangThai`, // /:id
    getBaoCaoByTenBaoCao: `${domain}/api/admin/baoCao/tenBaoCao`, // /:tenBaoCao
}

const giaoBaoCaoRoute = {
    findAll: `${domain}/api/admin/giaoBaoCao/all`,
    findById: `${domain}/api/admin/giaoBaoCao`, // /:id
    findByBaoCaoId: `${domain}/api/admin/giaoBaoCao`, //truyền query baoCaoId ?baoCaoId=
    findByNguoiNhapId: `${domain}/api/admin/giaoBaoCao/nguoiNhapId`, // /:idNguoiNhap
    create: `${domain}/api/admin/giaoBaoCao`,
    edit: `${domain}/api/admin/giaoBaoCao`, // // /:id body là giaoBaoCao
    delete: `${domain}/api/admin/giaoBaoCao`, // /:id
}

const cauHinhDonViNhanBaoCaoRoute = {
    findAll: `${domain}/api/admin/cauHinhDonViNhanBaoCao/all`,
    findByDonViNhanId: `${domain}/api/admin/cauHinhDonViNhanBaoCao/donViNhan`, // /:donViNhanId
    create: `${domain}/api/admin/cauHinhDonViNhanBaoCao`,
    delete: `${domain}/api/admin/cauHinhDonViNhanBaoCao`, // query ?donViNhanBaoCaoId=&donViGuiBaoCaoId=
};

const loaiKyBaoCaoRoute = {
    findAll: `${domain}/api/admin/loaiKyBaoCao/all`,
}

const kyBaoCaoRoute = {
    findAll: `${domain}/api/admin/kyBaoCao/all`,
    create: `${domain}/api/admin/kyBaoCao`,
    findById: `${domain}/api/admin/kyBaoCao`, // /:kyBaoCaoId
    update: `${domain}/api/admin/kyBaoCao`, // /:kyBaoCaoId
    delete: `${domain}/api/admin/kyBaoCao`, // /:kyBaoCaoId
}

const uploadFileRoute = {
    uploadFile: `${domain}/api/admin/upload`
}

const vaiTroRoute = {
    findAll: `${domain}/api/admin/vaiTro/all`,
    create: `${domain}/api/admin/vaiTro`,
    findById: `${domain}/api/admin/vaiTro`, // /:vaiTroId
    update: `${domain}/api/admin/vaiTro`, // /:vaiTroId
    delete: `${domain}/api/admin/vaiTro`, // /:vaiTroId
}

const tienIchThongBaoRoute = {
    findByNguoiNhanId: `${domain}/api/admin/tienIchThongBao/nguoiNhanId`, // /:nguoiNhanId
    create: `${domain}/api/admin/tienIchThongBao`, // body: tienIchThongBao
    update: `${domain}/api/admin/tienIchThongBao`, // /:id, body: tienIchThongBao
    detele: `${domain}/api/admin/tienIchThongBao`, // /:id
    sendMailAndSms: `${domain}/api/admin/tienIchThongBao/sendMailAndSms`, // body: tienIchThongBao
}

const quanLyApiKetNoiRoute = {
    findAll: `${domain}/api/admin/quanLyApiKetNoi`,
    create: `${domain}/api/admin/quanLyApiKetNoi`, // body quanLyApiKetNoi
    findById: `${domain}/api/admin/quanLyApiKetNoi`, // /:id
    update: `${domain}/api/admin/quanLyApiKetNoi`, // /:id, body quanLyApiKetNoi
    delete: `${domain}/api/admin/quanLyApiKetNoi`, // /:id
}

const quanLyTokenKetNoiRoute = {
    findAll: `${domain}/api/admin/quanLyTokenKetNoi`,
    create: `${domain}/api/admin/quanLyTokenKetNoi`, // body quanLyTokenKetNoi
    findById: `${domain}/api/admin/quanLyTokenKetNoi`, // /:id
    update: `${domain}/api/admin/quanLyTokenKetNoi`, // /:id, body quanLyTokenKetNoi
    delete: `${domain}/api/admin/quanLyTokenKetNoi`, // /:id
}

const quanLyPhanQuyenKetNoiRoute = {
    findAll: `${domain}/api/admin/quanLyPhanQuyenKetNoi`,
    create: `${domain}/api/admin/quanLyPhanQuyenKetNoi`, // body quanLyPhanQuyenKetNoi
    findById: `${domain}/api/admin/quanLyPhanQuyenKetNoi`, // /:id
    update: `${domain}/api/admin/quanLyPhanQuyenKetNoi`, // /:id, body quanLyPhanQuyenKetNoi
    delete: `${domain}/api/admin/quanLyPhanQuyenKetNoi`, // /:id
}

const danhMucChucVuRoute = {
    findAll: `${domain}/api/admin/danhMucChucVu`,
    create: `${domain}/api/admin/danhMucChucVu`, // body danhMucChucVu
    findById: `${domain}/api/admin/danhMucChucVu`, // /:id
    update: `${domain}/api/admin/danhMucChucVu`, // /:id, body danhMucChucVu
    delete: `${domain}/api/admin/danhMucChucVu`, // /:id
}

const danhMucQuocGiaRoute = {
    findAll: `${domain}/api/admin/danhMucQuocGia`,
    create: `${domain}/api/admin/danhMucQuocGia`, // body danhMucQuocGia
    findById: `${domain}/api/admin/danhMucQuocGia`, // /:id
    update: `${domain}/api/admin/danhMucQuocGia`, // /:id, body danhMucQuocGia
    delete: `${domain}/api/admin/danhMucQuocGia`, // /:id
}

const danhMucDonViHanhChinhRoute = {
    findAll: `${domain}/api/admin/danhMucDonViHanhChinh`,
    create: `${domain}/api/admin/danhMucDonViHanhChinh`, // body danhMucDonViHanhChinh
    findById: `${domain}/api/admin/danhMucDonViHanhChinh`, // /:id
    update: `${domain}/api/admin/danhMucDonViHanhChinh`, // /:id, body danhMucDonViHanhChinh
    delete: `${domain}/api/admin/danhMucDonViHanhChinh`, // /:id
}

const exportExcelMobileRoute = {
    export: `${domain}/api/admin/exportExcelMobile`, // body headerRows, rowData, merges
} 

export {domain,
    publicfolder,
    authRoute,
    tokenRoute,
    thongKeDangNhapSaiRoute,
    accountRoute,
    nhomChucNangRoute,
    chucNangRoute,
    chiTieuRoute,
    nhomChiTieuRoute,
    chiTietNhomChucNangRoute,
    phanQuyenRoute,
    cotBaoCaoRoute,
    nhapBaoCaoRoute,
    baoCaoRoute,
    donViRoute,
    giaoBaoCaoRoute,
    uploadFileRoute,
    cauHinhDonViNhanBaoCaoRoute,
    loaiKyBaoCaoRoute,
    kyBaoCaoRoute,
    vaiTroRoute,
    tienIchThongBaoRoute,
    quanLyApiKetNoiRoute,
    quanLyTokenKetNoiRoute,
    quanLyPhanQuyenKetNoiRoute,
    danhMucChucVuRoute,
    danhMucQuocGiaRoute,
    danhMucDonViHanhChinhRoute,
    exportExcelMobileRoute,
};