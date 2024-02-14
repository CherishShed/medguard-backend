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
const patientController = {
    getPatientInfo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { hospitalNumber } = req.query;
        try {
            const foundPatient = yield database_1.Patient.findOne({
                hospitalNumber: hospitalNumber,
            }, {
                hospitalNumber: 1,
                firstName: 1,
                lastName: 1,
                phone_number: 1,
                gender: 1,
            });
            if (foundPatient) {
                return res
                    .status(200)
                    .json({ patient: foundPatient, message: 'Found Record' });
            }
            else {
                return res
                    .status(404)
                    .json({ patient: null, message: 'Record does not exist' });
            }
        }
        catch (error) {
            return res.status(500).json({ error: error, message: 'An error occured' });
        }
    }),
};
exports.default = patientController;
