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
const database_1 = require("../Model/database");
const smsMiddleware_1 = __importDefault(require("../Middlewares/smsMiddleware"));
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
        const { hospitalNumber, blood_pressure, heart_beat, blood_oxygen } = req.query;
        try {
            const foundPatient = yield database_1.Patient.findOne({
                hospitalNumber: hospitalNumber,
            }, {
                vitals: 1,
                phone_number: 1,
                hospitalNumber: 1,
                firstName: 1,
                status: 1,
                latestVitals: 1,
            });
            if (foundPatient) {
                foundPatient.vitals.push({
                    blood_oxygen: parseInt(blood_oxygen),
                    blood_pressure: blood_pressure,
                    heart_beat: parseInt(heart_beat),
                });
                foundPatient.latestVitals = {
                    blood_oxygen: parseInt(blood_oxygen),
                    blood_pressure: blood_pressure,
                    heart_beat: parseInt(heart_beat),
                };
                const [systolic, diastolic] = blood_pressure
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
                if (parseInt(heart_beat) < 60 ||
                    parseInt(heart_beat) > 100) {
                    status = 'bad';
                }
                else if (parseInt(heart_beat) < 70 ||
                    parseInt(heart_beat) > 90) {
                    if (status !== 'bad') {
                        status = 'abnormal';
                    }
                }
                foundPatient.status = status;
                foundPatient.save();
                const from = process.env.VONAGE_VIRTUAL_NUMBER;
                const to = foundPatient.phone_number;
                const text = `Dear ${foundPatient.firstName}, your Vitals do not look good please visit the hospital as soon as possible.\nBlood pressure: ${blood_pressure}mmHg\nHeartbeat: ${heart_beat}bpm\n`;
                function sendSMS() {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield smsMiddleware_1.default.sms
                            .send({ to, from, text, title: 'Medguard' })
                            .then(resp => {
                            console.log('Message sent successfully');
                            console.log(resp);
                        })
                            .catch(err => {
                            console.log('There was an error sending the messages.');
                            console.error(err);
                        });
                    });
                }
                if (status === 'bad' || 'abnormal') {
                    sendSMS();
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
