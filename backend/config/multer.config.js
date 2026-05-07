
import multer from "multer";
import path from "path";
import fs from "fs";


const UPLOAD_DIR = "uploads/escalations";
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});


const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/vnd.ms-outlook",
        "application/octet-stream",
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedExt = [".pdf", ".xlsx", ".xls", ".csv", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".msg"].includes(ext);

    if (allowedMimeTypes.includes(file.mimetype) || (ext === ".msg" && file.mimetype === "application/octet-stream") || isAllowedExt) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Allowed: PDF, Excel, CSV, Word, Images (PNG/JPG), .msg."), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
