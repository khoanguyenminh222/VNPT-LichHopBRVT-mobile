const domain = process.env.domain;
const baseURL = process.env.domain;
let publicfolder = domain + "/uploads"
const authRoute = {
    login: `${baseURL}/api/auth/login`,
    resetPassword: `${baseURL}/api/auth/resetPassword`,
    casbrvtlogin: `${baseURL}/api/auth/casbrvtlogin`,
};

const tokenRoute = {
    refreshToken: `${baseURL}/api/token`,
    deleteToken: `${baseURL}/api/token`,
}

const thongKeDangNhapSaiRoute = {
    findByUserName: `${baseURL}/api/thongKeDangNhapSai`, // /:username
    create: `${baseURL}/api/thongKeDangNhapSai`, // body thongKeDangNhapSai
    update: `${baseURL}/api/thongKeDangNhapSai`, // /:id, body thongKeDangNhapSai
    delete: `${baseURL}/api/thongKeDangNhapSai`, // /:id
}

const accountRoute = {
    findAll: `${baseURL}/api/admin/account/findAll`,
    findById: `${baseURL}/api/admin/account`, // /:id 
    findByUsername: `${baseURL}/api/admin/account/username`, // /:username 
    findSameDonVi: `${baseURL}/api/admin/account/donViId`, // /:donViId
    create: `${baseURL}/api/admin/account`,
    update: `${baseURL}/api/admin/account`, // /:id
    delete: `${baseURL}/api/admin/account`, // /:id
};

const nhomChucNangRoute = {
    findAll: `${baseURL}/api/admin/nhomChucNang`,
    create: `${baseURL}/api/admin/nhomChucNang`,
    update: `${baseURL}/api/admin/nhomChucNang`, // /:id body là nhomChucNang
    delete: `${baseURL}/api/admin/nhomChucNang`, // /:id
};

const chucNangRoute = {
    findAll: `${baseURL}/api/admin/chucNang`,
    findById: `${baseURL}/api/admin/chucNang`, // /:id
    create: `${baseURL}/api/admin/chucNang`,
    edit: `${baseURL}/api/admin/chucNang`, // /:id body là chucNang
    delete: `${baseURL}/api/admin/chucNang`, // /:id
};

const chiTieuRoute = {
    findAll: `${baseURL}/api/admin/chiTieu`,
    findById: `${baseURL}/api/admin/chiTieu`, // /:id
    create: `${baseURL}/api/admin/chiTieu`,
    edit: `${baseURL}/api/admin/chiTieu`, // /:id body là chiTieu
    delete: `${baseURL}/api/admin/chiTieu`, // /:id
    findDSChiTieuByNhomChiTieuId: `${baseURL}/api/admin/chiTieu/findDSChiTieuByNhomChiTieuId`, // /:nhomChiTieuId
};

const nhomChiTieuRoute = {
    findAll: `${baseURL}/api/admin/nhomChiTieu`,
    findById: `${baseURL}/api/admin/nhomChiTieu`, // /:id
    create: `${baseURL}/api/admin/nhomChiTieu`,
    edit: `${baseURL}/api/admin/nhomChiTieu`, // /:id body là nhomChiTieu
    delete: `${baseURL}/api/admin/nhomChiTieu`, // /:id
};

const chiTietNhomChucNangRoute = {
    getChucNangsByNhomChucNang: `${baseURL}/api/admin/chiTietNhomChucNang`, // truyền query nhomChucNangId ?nhomChucNangId=
    saveChucNangsForNhomChucNang: `${baseURL}/api/admin/chiTietNhomChucNang`,
};

const phanQuyenRoute = {
    getNhomChucNangByAccountId: `${baseURL}/api/admin/phanQuyen/nhomChucNang`, // truyền query accountId ?accountId=
    getChucNangByAccountId: `${baseURL}/api/admin/phanQuyen/chucNang`, // truyền query accountId ?accountId=
    savePhanQuyenForAccount: `${baseURL}/api/admin/phanQuyen`,
};

const uploadFileRoute = {
    uploadFile: `${baseURL}/api/admin/upload`
}

const vaiTroRoute = {
    findAll: `${baseURL}/api/admin/vaiTro/all`,
    create: `${baseURL}/api/admin/vaiTro`,
    findById: `${baseURL}/api/admin/vaiTro`, // /:vaiTroId
    update: `${baseURL}/api/admin/vaiTro`, // /:vaiTroId
    delete: `${baseURL}/api/admin/vaiTro`, // /:vaiTroId
}

const eventRoute = {
    findAll: `${baseURL}/api/admin/event`,
    create: `${baseURL}/api/admin/event`, // body là event
    findById: `${baseURL}/api/admin/event`, // /:eventId
    update: `${baseURL}/api/admin/event`, // /:eventId body là event
    delete: `${baseURL}/api/admin/event`, // /:eventId
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
};