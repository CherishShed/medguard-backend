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
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../Model/database");
const EmployeeController = {
    getAllPatients: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const allPatients = yield database_1.Patient.find();
            return res.status(200).json({ patients: allPatients, success: true });
        }
        catch (error) {
            return res.status(500).json({ error: error, message: 'an error occured' });
        }
    }),
    linkClerkId: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { employeeNumber, clerkId } = req.query;
        try {
            const foundEmployee = yield database_1.HealthWorker.findOne({
                employeeNumber: employeeNumber,
            });
            if (!foundEmployee) {
                return res
                    .status(404)
                    .json({ message: 'User not found', success: false });
            }
            else {
                foundEmployee.clerkId = clerkId;
                foundEmployee.save();
                return res.status(200).json({ message: 'success', success: true });
            }
        }
        catch (error) {
            return res.status(500).json({ message: 'error', error: error });
        }
    }),
};
exports.default = EmployeeController;
