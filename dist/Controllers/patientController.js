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
const helperFunctions_1 = require("../Utils/helperFunctions");
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
    addVitals: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const vitals = req.body;
        const { hospitalNumber } = req.query;
        try {
            const foundPatient = yield database_1.Patient.findOne({
                hospitalNumber: hospitalNumber,
            }, {
                vitals: 1,
                phone_number: 1,
                hospitalNumber: 1,
                firstName: 1,
                lastName: 1,
                status: 1,
                latestVitals: 1,
            });
            const typedVitals = vitals.map(reading => ({
                blood_oxygen: parseInt(reading.blood_oxygen),
                blood_pressure: reading.blood_pressure,
                heart_beat: parseInt(reading.heart_beat),
            }));
            if (foundPatient) {
                foundPatient.vitals.push(...typedVitals);
                foundPatient.latestVitals = typedVitals[typedVitals.length - 1];
                const latestBlood_pressure = typedVitals[typedVitals.length - 1].blood_pressure;
                const latestHeart_beat = typedVitals[typedVitals.length - 1].heart_beat;
                const latestBlood_oxygen = typedVitals[typedVitals.length - 1].blood_oxygen;
                const [systolic, diastolic] = latestBlood_pressure
                    .split('/')
                    .map(Number);
                let status = 'good';
                if (systolic < 90 ||
                    systolic > 140 ||
                    diastolic < 60 ||
                    diastolic > 90) {
                    status = 'bad';
                }
                else if (systolic < 120 || diastolic < 80) {
                    status = 'abnormal';
                }
                if (latestHeart_beat < 60 || latestHeart_beat > 100) {
                    status = 'bad';
                }
                else if (latestHeart_beat < 70 || latestHeart_beat > 90) {
                    if (status !== 'bad') {
                        status = 'abnormal';
                    }
                }
                if (latestBlood_oxygen < 90) {
                    status = 'bad';
                }
                else if (latestBlood_oxygen < 95) {
                    if (status !== 'bad') {
                        status = 'abnormal';
                    }
                }
                foundPatient.status = status;
                foundPatient.save();
                const to = foundPatient.phone_number;
                const text = `Dear ${foundPatient.firstName}, your Vitals do not look good please visit the hospital as soon as possible.\nBlood pressure: ${latestBlood_pressure}mmHg\nHeartbeat: ${latestHeart_beat}bpm\nBlood Oxygen: ${latestBlood_oxygen}%\n`;
                const hospitalText = `Alert!!!\nThe Vitals of this patient does not look good.\nHospital Number: ${foundPatient.hospitalNumber}\nName: ${foundPatient.firstName} ${foundPatient.lastName}.\nBlood pressure: ${latestBlood_pressure}mmHg\nHeartbeat: ${latestHeart_beat}bpm\nBlood Oxygen: ${latestBlood_oxygen}%\n`;
                if (status === 'bad' || 'abnormal') {
                    (0, helperFunctions_1.sendSMS)(to, text);
                    setTimeout(() => {
                        (0, helperFunctions_1.sendSMS)('2348152819194', hospitalText);
                    }, 3000);
                }
                return res.status(200).json({ Success: true, message: 'Success' });
            }
            else {
                return res
                    .status(404)
                    .json({ patient: null, message: 'Patient does not exist' });
            }
        }
        catch (error) {
            return res.status(500).json({ error: error, message: 'An error occured' });
        }
    }),
    getMedications: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { hospitalNumber } = req.query;
        try {
            const prescriptions = yield database_1.Prescription.find({
                patient: hospitalNumber,
            });
            if (prescriptions.length > 0) {
                return res.status(200).json({ prescriptions, message: 'Success' });
            }
            else {
                return res
                    .status(404)
                    .json({ patient: null, message: 'Patient does not exist' });
            }
        }
        catch (error) {
            return res.status(500).json({ error: error, message: 'An error occured' });
        }
    }),
};
exports.default = patientController;
