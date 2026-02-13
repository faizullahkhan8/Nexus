"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dbz7msmyl",
    api_key: process.env.CLOUDINARY_API_KEY || "224877555621467",
    api_secret: process.env.CLOUDINARY_API_SECRET || "tlmyv2HSH9MKTqdZHM2_V2XO4HE",
});
exports.default = cloudinary_1.v2;
