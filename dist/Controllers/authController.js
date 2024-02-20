"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../Model/database");
const authController = {
    loginUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userName, password } = req.body;
        try {
            const user = yield database_1.HealthWorker.findOne({
                employeeNumber: userName.toUpperCase(),
            });
            if (!user) {
                res
                    .status(401)
                    .json({ auth: false, message: 'User not found', user: null });
                return;
            }
            const match = yield (0, bcrypt_1.compare)(password, user.password);
            if (!match) {
                res
                    .status(401)
                    .json({ auth: false, message: 'Incorrrect Password', user: null });
                return;
            }
            const accessToken = jsonwebtoken_1.default.sign({
                employeeNumber: user.employeeNumber,
                first_name: user.firstName,
                last_name: user.lastName,
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3h' });
            res.status(200).json({
                auth: true,
                message: 'Login successful',
                user: {
                    employeeNumber: user.employeeNumber,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    gender: user.gender,
                    dateOfBirth: user.dateOfBirth,
                    phoneNumber: user.phoneNumber,
                    changedPassword: user.changedPassword,
                },
                accessToken,
            });
            return;
        }
        catch (error) {
            if (error) {
                res.status(500).json({ errors: [{ msg: 'Error authenticating user' }] });
                return;
            }
        }
    }),
    changePassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { employeeNumber, newPassword, oldPassword } = req.body;
        const hashedPassword = yield (0, bcrypt_1.hash)(newPassword, 10);
        try {
            const existingUser = yield database_1.HealthWorker.findOne({
                employeeNumber: employeeNumber,
            }, { employeeNumber: 1, changedPassword: 1, password: 1 });
            if (existingUser) {
                const match = yield (0, bcrypt_1.compare)(oldPassword, existingUser.password);
                if (!match) {
                    return res
                        .status(401)
                        .json({ auth: false, message: 'Incorrrect Password', user: null });
                }
                existingUser.password = hashedPassword;
                existingUser.changedPassword = true;
                existingUser.save();
                return res.status(200).json({ success: true });
            }
            else {
                return res
                    .status(404)
                    .json({ success: false, message: 'user not found' });
            }
        }
        catch (error) {
            return res
                .status(500)
                .json({ success: false, message: 'An error occured' });
        }
    }),
    logout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        req.logout(err => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: err, success: false, message: 'An error occured' });
            }
            return res.status(200).json({ success: true });
        });
    }),
};
exports.default = authController;
