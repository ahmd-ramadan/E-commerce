const multer = require('multer');
const fs = require('fs'); 
const path = require('path');

const { generateUniqueString } = require('../utils/auth.js');
const { allowedExtensions } = require('../utils/allowedExtensions.js');

module.exports.multerMiddleLocal = ({
    extensions = allowedExtensions.image,
    filePath = "general",
}) => {
    const destinationPath = path.resolve(`src/uploads/${filePath}`); // return the full path till the src/uploads/${filePath}

    //! Path check
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }
    //! diskStorage
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destinationPath);
        },
        filename: (req, file, cb) => {
            const uniqueFileName = generateUniqueString() + "_" + file.originalname;
            cb(null, uniqueFileName);
        },
    });

    //! file Filter
    const fileFilter = (req, file, cb) => {
        if (extensions.includes(file.mimetype.split("/")[1])) {
            return cb(null, true);
        }
        cb(new Error("Image format is not allowed!", { status: 400 }));
    };

    const file = multer({ fileFilter, storage });
    return file;
};

module.exports.multerMiddleHost = ({ extensions = allowedExtensions.image }) => {
    //! diskStorage
    const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const uniqueFileName = generateUniqueString() + "_" + file.originalname;
            cb(null, uniqueFileName);
        },
    });

    //! file Filter
    const fileFilter = (req, file, cb) => {
        // console.log(file.mimetype.split("/")[1]);
        if (extensions.includes(file.mimetype.split("/")[1])) {
            return cb(null, true);
        }
        cb(new Error("Image format is not allowed!", { status: 400 }));
    };

    const file = multer({ fileFilter, storage });
    return file;
};