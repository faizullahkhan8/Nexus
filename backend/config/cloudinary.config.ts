import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dbz7msmyl",
    api_key: process.env.CLOUDINARY_API_KEY || "224877555621467",
    api_secret:
        process.env.CLOUDINARY_API_SECRET || "tlmyv2HSH9MKTqdZHM2_V2XO4HE",
});

export default cloudinary;
