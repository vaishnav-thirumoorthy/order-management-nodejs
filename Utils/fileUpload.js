const multer = require('multer')
const AWS = require('aws-sdk')
const multerS3 = require('multer-s3')
require('dotenv').config()

//upload to AWS s3

const myConfig = new AWS.Config()

myConfig.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const storage_s3 = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    acl: 'public-read',
    contentDisposition: 'inline',
    cacheControl: 'max-age=604800',
    key: function (req, file, cb) {
        cb(null, (new Date().toISOString()) + "-MI_" + file.originalname);
    }
})


const upload_s3 = multer({
    storage: storage_s3
})
const file_s3 = upload_s3.single('image')

//upload to local

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/MenuItems')
    },
    filename: function (req, file, cb) {
        cb(null, (new Date().toISOString()) + "-MI_" + file.originalname)

    }
})

const upload = multer({
    storage
})
const file = upload.single('image')

const deletefromS3 = async (file) => {
    s3.deleteObject({
        Bucket: process.env.AWS_BUCKET.toString(),
        Key: file.toString()
    }, function (err, data) {
        if (data) {
            return "Deleted"
        } else {
            return err
        }
    })
}


module.exports = {
    file,
    file_s3,
    deletefromS3
}