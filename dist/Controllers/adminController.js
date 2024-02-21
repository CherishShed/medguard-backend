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
            const allPatients = yield database_1.Patient.find({}, {
                firstName: 1,
                lastName: 1,
                latestVitals: 1,
                hospitalNumber: 1,
                gender: 1,
                status: 1,
            });
            allPatients.forEach(patient => {
                const latestVitals = patient.latestVitals;
                const bloodPressure = latestVitals.blood_pressure;
                const [systolic, diastolic] = bloodPressure.split('/').map(Number);
                if (systolic < 90 ||
                    systolic > 140 ||
                    diastolic < 60 ||
                    diastolic > 90) {
                    patient.status = 'bad';
                }
                else if (systolic < 120 || diastolic < 80) {
                    patient.status = 'abnormal';
                }
                else {
                    patient.status = 'good';
                }
                const heartRate = latestVitals.heart_beat;
                if (heartRate < 60 || heartRate > 100) {
                    patient.status = 'bad';
                }
                else if (heartRate < 70 || heartRate > 90) {
                    if (patient.status != 'bad') {
                        patient.status = 'abnormal';
                    }
                }
                else {
                    if (patient.status !== ('bad' || 'abnormal')) {
                        patient.status = 'good';
                    }
                }
                patient.save();
            });
            return res.status(200).json({ patients: allPatients, success: true });
        }
        catch (error) {
            return res.status(500).json({ error: error, message: 'an error occured' });
        }
    }),
    dashBoardStatistics: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const allPatients = yield database_1.Patient.find({}, { latestVitals: 1 });
            const medPatients = yield database_1.Patient.find({
                'medications.end_date': {
                    $gte: new Date().toISOString().split('T')[0],
                },
            }, { hospitalNumber: 1 });
            const vitalCount = {
                warningCount: 0,
                badCount: 0,
            };
            allPatients.forEach(patient => {
                const latestVitals = patient.latestVitals;
                const bloodPressure = latestVitals.blood_pressure;
                const [systolic, diastolic] = bloodPressure.split('/').map(Number);
                if (systolic < 90 ||
                    systolic > 140 ||
                    diastolic < 60 ||
                    diastolic > 90) {
                    vitalCount.badCount++;
                }
                else if (systolic < 120 || diastolic < 80) {
                    vitalCount.warningCount++;
                }
                const heartRate = latestVitals.heart_beat;
                if (heartRate < 60 || heartRate > 100) {
                    vitalCount.badCount++;
                }
                else if (heartRate < 70 || heartRate > 90) {
                    vitalCount.warningCount++;
                }
            });
            return res.status(200).json({
                message: 'success',
                patientsNumber: allPatients.length,
                patientsOnMedication: medPatients.length,
                vitalCount: vitalCount,
            });
        }
        catch (error) {
            return res.status(500).json({ message: 'error', error: error });
        }
    }),
};
exports.default = EmployeeController;
