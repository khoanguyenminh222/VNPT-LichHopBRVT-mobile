const domain = process.env.domain;
let publicfolder = domain + "/uploads"
const authRoute = {
    login: `${domain}/api/auth/login`,
    resetPassword: `${domain}/api/auth/resetPassword`,
    casbrvtlogin: `${domain}/api/auth/casbrvtlogin`,
};

const tokenRoute = {
    refreshToken: `${domain}/api/token`,
    deleteToken: `${domain}/api/token`,
    saveToken: `${domain}/api/token/save`
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

const phanQuyenRoute = {
    getNhomChucNangByAccountId: `${domain}/api/admin/phanQuyen/nhomChucNang`, // truyền query accountId ?accountId=
    getChucNangByAccountId: `${domain}/api/admin/phanQuyen/chucNang`, // truyền query accountId ?accountId=
    savePhanQuyenForAccount: `${domain}/api/admin/phanQuyen`,
    getChucNangForAllAccounts: `${domain}/api/admin/phanQuyen/chucNangForAllAccounts`,
};

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

const eventRoute = {
    findAll: `${domain}/api/admin/event`,
    create: `${domain}/api/admin/event`, // body là event
    findById: `${domain}/api/admin/event`, // /:eventId
    update: `${domain}/api/admin/event`, // /:eventId body là event
    delete: `${domain}/api/admin/event`, // /:eventId
}

const lichCaNhanRoute = {
    findAll: `${domain}/api/admin/lichCaNhan`,
    create: `${domain}/api/admin/lichCaNhan`, // body là lichCaNhan
    findById: `${domain}/api/admin/lichCaNhan`, // /:lichCaNhanId
    update: `${domain}/api/admin/lichCaNhan`, // /:lichCaNhanId body là lichCaNhan
    delete: `${domain}/api/admin/lichCaNhan`, // /:lichCaNhanId
    findByAccountId: `${domain}/api/admin/lichCaNhan/account`, // /:accountId
}

const diaDiemHopRoute = {
    findAll: `${domain}/api/admin/diaDiemHop`,
    create: `${domain}/api/admin/diaDiemHop`,
    findById: `${domain}/api/admin/diaDiemHop`, // /:id
    update: `${domain}/api/admin/diaDiemHop`, // /:id
    delete: `${domain}/api/admin/diaDiemHop`, // /:id
}

const thanhPhanThamDuRoute = {
    findAll: `${domain}/api/admin/thanhPhanThamDu`,
    create: `${domain}/api/admin/thanhPhanThamDu`,
    update: `${domain}/api/admin/thanhPhanThamDu`, // /:id
    delete: `${domain}/api/admin/thanhPhanThamDu`, // /:id
    getCotCha: `${domain}/api/admin/thanhPhanThamDu/cotCha` // /:idCotCha
}

const accountDuyetLichRoute = {
    findAll: `${domain}/api/admin/accountDuyetLich`,
    create: `${domain}/api/admin/accountDuyetLich`,
    update: `${domain}/api/admin/accountDuyetLich`, // /:username body là accountDuyetLich
    delete: `${domain}/api/admin/accountDuyetLich`, // /:id
}
const sendSMSRoute = {
    sendSMS: `${domain}/api/admin/sendsms`
}

const thongBaoNhacNhoRoute = {
    findByEventIdAndAccountId: `${domain}/api/admin/thongBaoNhacNho`,
    create: `${domain}/api/admin/thongBaoNhacNho`,
    update: `${domain}/api/admin/thongBaoNhacNho`, // /:id body là thongBaoNhacNho
    delete: `${domain}/api/admin/thongBaoNhacNho`, // /:id
}

const thongBaoNhacNhoLichCaNhanRoute = {
    findByEventIdAndAccountId: `${domain}/api/admin/thongBaoNhacNhoLichCaNhan`,
    create: `${domain}/api/admin/thongBaoNhacNhoLichCaNhan`,
    update: `${domain}/api/admin/thongBaoNhacNhoLichCaNhan`, // /:id body là thongBaoNhacNho
    delete: `${domain}/api/admin/thongBaoNhacNhoLichCaNhan`, // /:id
}

const accountNhanSMSRoute = {
    findAll: `${domain}/api/admin/accountNhanSMS`,
    create: `${domain}/api/admin/accountNhanSMS`,
    update: `${domain}/api/admin/accountNhanSMS`, // /:id body là accountNhanSMS
    delete: `${domain}/api/admin/accountNhanSMS`, // /:id
}

const eventHistoryRoute = {
    findAll: `${domain}/api/admin/eventHistory`,
    create: `${domain}/api/admin/eventHistory`,
    update: `${domain}/api/admin/eventHistory`, // /:id body là eventHistory
    delete: `${domain}/api/admin/eventHistory`, // /:id
    findByEventId: `${domain}/api/admin/eventHistory/event`, // /:eventId
}

const linkBIRoute = {
    findAll: `${domain}/api/admin/linkBI`,
    create: `${domain}/api/admin/linkBI`,
    findById: `${domain}/api/admin/linkBI`, // /:id
    update: `${domain}/api/admin/linkBI`, // /:id
    delete: `${domain}/api/admin/linkBI`, // /:id
}

const duAnRoute = {
    findAll: `${domain}/api/admin/duAn`,
    create: `${domain}/api/admin/duAn`,
    findById: `${domain}/api/admin/duAn`, // /:id
    update: `${domain}/api/admin/duAn`, // /:id
    delete: `${domain}/api/admin/duAn`, // /:id
}

export {
    domain,
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
    uploadFileRoute,
    vaiTroRoute,
    eventRoute,
    lichCaNhanRoute,
    diaDiemHopRoute,
    thanhPhanThamDuRoute,
    accountDuyetLichRoute,
    sendSMSRoute,
    thongBaoNhacNhoRoute,
    thongBaoNhacNhoLichCaNhanRoute,
    accountNhanSMSRoute,
    eventHistoryRoute,
    linkBIRoute,
    duAnRoute,
};