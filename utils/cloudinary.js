import axios from "axios";

const CLOUDINARY_UPLOAD_PRESET = "campus-pulse-preset";
const CLOUDINARY_CLOUD_NAME = "dpfrwxe1r";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadImageToCloudinary = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    });
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.secure_url;
  } catch (err) {
    console.log("Error: " + err.message);
    throw err;
  }
};
