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
    getPatientInfo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { hospitalNumber } = req.query;
        try {
            const foundPatient = yield database_1.Patient.findOne({
                hospitalNumber: hospitalNumber,
            }, {
                firstName: 1,
                lastName: 1,
                latestVitals: 1,
                hospitalNumber: 1,
                gender: 1,
                status: 1,
                bloodgroup: 1,
                dateOfBirth: 1,
                genotype: 1,
                phone_number: 1,
                emergencyContact1: 1,
                emergencyContact2: 1,
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
    getPatientPrescriptions: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { hospitalNumber } = req.query;
        try {
            const foundPatient = yield database_1.Patient.findOne({
                hospitalNumber: hospitalNumber,
            }, {
                firstName: 1,
                lastName: 1,
                hospitalNumber: 1,
                gender: 1,
                phone_number: 1,
                lastUpdatedBy: 1,
            }).populate({
                path: 'lastUpdatedBy',
                select: 'firstName lastName -_id',
            });
            if (foundPatient) {
                const prescriptions = yield database_1.Prescription.find({
                    patient: hospitalNumber,
                });
                const activePrescriptions = prescriptions.filter(prescription => prescription.active === true);
                const endedPrescriptions = prescriptions.filter(prescription => prescription.active === false);
                activePrescriptions.sort((a, b) => {
                    const dateA = new Date(a.prescriptionDate).getTime();
                    const dateB = new Date(b.prescriptionDate).getTime();
                    return dateB - dateA;
                });
                endedPrescriptions.sort((a, b) => {
                    const dateA = new Date(a.prescriptionDate).getTime();
                    const dateB = new Date(b.prescriptionDate).getTime();
                    return dateB - dateA;
                });
                return res.status(200).json({
                    patient: foundPatient,
                    message: 'Found Record',
                    activePrescriptions,
                    endedPrescriptions,
                });
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
                    if (patient.status !== 'bad' && patient.status !== 'abnormal') {
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
            const allPatients = yield database_1.Patient.find({}, { status: 1 });
            const medPatients = yield database_1.Prescription.find({
                active: true,
            }, { active: 1 });
            const vitalCount = {
                warningCount: 0,
                badCount: 0,
            };
            allPatients.forEach(patient => {
                const status = patient.status;
                if (status === 'bad') {
                    vitalCount.badCount++;
                }
                else if (status === 'abnormal') {
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
    addMedication: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { prescriptionId } = req.query;
        const medData = req.body;
        try {
            const updatedPrescription = yield database_1.Prescription.findOneAndUpdate({ id: prescriptionId }, {
                $push: { drugs: medData },
                $set: {
                    lastUpdatedBy: req.user._id,
                },
            });
            if (!updatedPrescription) {
                return res
                    .status(404)
                    .json({ message: 'Invalid Prescription', success: false });
            }
            if (new Date(medData.end_date) > new Date(Date.now())) {
                updatedPrescription.active = true;
            }
            const foundPatient = yield database_1.Patient.findOne({
                hospitalNumber: updatedPrescription.patient,
            }, { lastUpdatedBy: 1 });
            foundPatient.lastUpdatedBy = req.user._id;
            foundPatient.save();
            return res
                .status(200)
                .json({ message: 'Added Medication Successfully', success: true });
        }
        catch (error) {
            return res
                .status(500)
                .json({ message: 'An error occurred', success: false, error });
        }
    }),
    addPrescription: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { prescriptionDate, drugs, hospitalNumber } = req.body;
            const newPrescription = new database_1.Prescription({
                prescriptionDate,
                drugs,
                patient: hospitalNumber,
                lastUpdatedBy: req.user._id,
            });
            const foundPatient = yield database_1.Patient.findOne({
                hospitalNumber: hospitalNumber,
            }, { lastUpdatedBy: 1 });
            foundPatient.lastUpdatedBy = req.user._id;
            foundPatient.save();
            yield newPrescription.save();
            res.status(201).json({
                message: 'Prescription created successfully',
                prescription: newPrescription,
            });
        }
        catch (error) {
            console.error('Error creating prescription:', error);
            res
                .status(500)
                .json({ error: 'An error occurred while creating prescription' });
        }
    }),
    getPatientVitals: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { hospitalNumber } = req.query;
        try {
            const foundPatient = yield database_1.Patient.findOne({
                hospitalNumber: hospitalNumber,
            }, {
                firstName: 1,
                lastName: 1,
                hospitalNumber: 1,
                gender: 1,
                phone_number: 1,
                vitals: 1,
                status: 1,
            });
            if (!foundPatient) {
                return res
                    .status(404)
                    .json({ message: 'Patient not found', success: false });
            }
            return res
                .status(200)
                .json({ patientDetails: foundPatient, success: true });
        }
        catch (error) {
            return res
                .status(500)
                .json({ message: 'An error occurred', success: false });
        }
    }),
    getSinglePrescription: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { prescriptionId } = req.query;
        try {
            const prescription = yield database_1.Prescription.findById(prescriptionId);
            if (!prescription) {
                return res
                    .status(404)
                    .json({ message: 'Invalid Prescription', success: false });
            }
            return res.status(200).json({ prescription, success: true });
        }
        catch (error) {
            return res
                .status(500)
                .json({ message: 'An error occurred', success: false, error });
        }
    }),
};
exports.default = EmployeeController;
