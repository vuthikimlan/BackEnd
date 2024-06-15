const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

const serviceAccount = require("../../../e-learning-17f36-firebase-adminsdk-q9ccz-6f6bcc760b.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://e-learning-17f36.appspot.com",
});

const bucket = admin.storage().bucket();

const uploadFile = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("No file upload");
  }

  const metadata = {
    metadata: {
      firebaseStorageDownloadTokens: uuidv4(), //Tạo ra một token cho việc tải xuống tệp tin
    },
    contentType: req.file.mimetype, // Là loại nội dung của tệp tin
    cacheControl: "public, max-age=31536000",
  };

  const blob = bucket.file(req.file.originalname);

  const blodStream = blob.createWriteStream({
    metadata: metadata,
    gzip: true,
  });

  blodStream.on("error", (err) => {
    return res.status(500).json({
      error: "Không thể upload file",
    });
  });

  blodStream.on("finish", () => {
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(blob.name)}?alt=media&token=${
      metadata.metadata.firebaseStorageDownloadTokens
    }`;
    return res.status(202).json({
      success: true,
      data: fileUrl,
    });
  });

  blodStream.end(req.file.buffer);
};

module.exports = {
  uploadFile,
};
