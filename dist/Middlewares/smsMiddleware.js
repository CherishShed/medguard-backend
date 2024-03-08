"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_sdk_1 = require("@vonage/server-sdk");
require("dotenv/config");
const vonage = new server_sdk_1.Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
});
exports.default = vonage;
