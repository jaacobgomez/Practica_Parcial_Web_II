import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary.js";

class CloudinaryService {
  async uploadBuffer(buffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || "bildyapp",
          resource_type: options.resourceType || "auto",
          public_id: options.publicId,
          overwrite: options.overwrite ?? true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      const readable = Readable.from(buffer);
      readable.pipe(uploadStream);
    });
  }
}

const cloudinaryService = new CloudinaryService();

export default cloudinaryService;