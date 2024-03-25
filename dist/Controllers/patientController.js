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
                dateOfBirth: 1,
            });
            const typedVitals = {
                temperature: parseInt(vitals.temperature),
                blood_oxygen: parseInt(vitals.blood_oxygen),
                heart_beat: parseInt(vitals.heart_beat),
                blood_pressure: vitals.blood_pressure,
            };
            if (foundPatient) {
                foundPatient.vitals.push(typedVitals);
                foundPatient.latestVitals = typedVitals;
                const latestBlood_pressure = typedVitals.blood_pressure;
                const latestHeart_beat = typedVitals.heart_beat;
                const latestBlood_oxygen = typedVitals.blood_oxygen;
                const latestTemperature = typedVitals.temperature;
                const patientAge = (0, helperFunctions_1.calculateAge)(foundPatient.dateOfBirth);
                const upperLimitHeartRate = 220 - patientAge;
                const [systolic, diastolic] = latestBlood_pressure
                    .split('/')
                    .map(Number);
                let status = 'good';
                if (systolic == 0 || diastolic == 0) {
                    status = 'good';
                }
                else if (systolic < 90 ||
                    systolic > 140 ||
                    diastolic < 60 ||
                    diastolic > 90) {
                    status = 'bad';
                }
                else if (systolic < 120 || diastolic < 80) {
                    status = 'abnormal';
                }
                if (latestHeart_beat < 50 ||
                    latestHeart_beat > upperLimitHeartRate + 5) {
                    status = 'bad';
                }
                else if (latestHeart_beat < 60 ||
                    latestHeart_beat > upperLimitHeartRate) {
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
                if (latestTemperature > 39 || latestTemperature < 34) {
                    status = 'bad';
                }
                else if (latestTemperature > 37.2 || latestTemperature < 36) {
                    if (status !== 'bad') {
                        status = 'abnormal';
                    }
                }
                foundPatient.status = status;
                foundPatient.save();
                if (latestBlood_oxygen == 0 &&
                    latestHeart_beat == 0 &&
                    latestTemperature == 0) {
                    status = 'good';
                }
                const to = foundPatient.phone_number;
                const text = `Dear ${foundPatient.firstName}, your Vitals do not look good please visit the hospital as soon as possible.\nTemperature: ${latestTemperature} degrees\nHeartbeat: ${latestHeart_beat}bpm\nBlood Oxygen: ${latestBlood_oxygen}%\n`;
                const hospitalText = `Alert!!!\nThe Vitals of this patient do not look good.\nHospital Number: ${foundPatient.hospitalNumber}Name: ${foundPatient.firstName} ${foundPatient.lastName}.\n\nPhone Number: ${foundPatient.phone_number}\nTemperature: ${latestTemperature} degrees\nHeartbeat: ${latestHeart_beat}bpm\nBlood Oxygen: ${latestBlood_oxygen}%\n`;
                if (status != 'good') {
                    (0, helperFunctions_1.sendSMS)(to, text);
                    setTimeout(() => {
                        (0, helperFunctions_1.sendSMS)('2349167648722', hospitalText);
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
