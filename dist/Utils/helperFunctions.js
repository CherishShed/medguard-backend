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
exports.calculateAge = exports.sendSMS = exports.medicationReminder = exports.updatePrescriptions = void 0;
const axios_1 = __importDefault(require("axios"));
const database_1 = require("../Model/database");
require("dotenv/config");
const updatePrescriptions = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    const prescriptions = yield database_1.Prescription.find();
    prescriptions.map(prescription => {
        const drugs = prescription.drugs;
        let active = false;
        for (const drug of drugs) {
            const endDate = new Date(drug.end_date);
            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth();
            const endDay = endDate.getDate();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const currentDay = currentDate.getDate();
            if (endYear > currentYear ||
                (endYear === currentYear && endMonth > currentMonth) ||
                (endYear === currentYear &&
                    endMonth >= currentMonth &&
                    endDay >= currentDay)) {
                active = true;
                break;
            }
        }
        prescription.active = active;
        prescription.save();
    });
});
exports.updatePrescriptions = updatePrescriptions;
const medicationReminder = () => __awaiter(void 0, void 0, void 0, function* () {
    const prescriptions = yield database_1.Prescription.find({ active: true }, { active: 1, patient: 1, drugs: 1 });
    prescriptions.forEach((prescription) => __awaiter(void 0, void 0, void 0, function* () {
        const foundPatient = yield database_1.Patient.findOne({ hospitalNumber: prescription.patient }, { phone_number: 1, firstName: 1 });
        if (foundPatient) {
            const to = foundPatient.phone_number;
            let text = `Dear ${foundPatient.firstName}, these are your drugs for the day.\n`;
            prescription.drugs.forEach(drug => {
                if (new Date(drug.end_date) >= new Date()) {
                    let drugNoun = 'dose';
                    if (drug.type.toLowerCase() === 'injection') {
                        drugNoun = 'Mg';
                    }
                    else if (drug.type.toLowerCase() === 'syrup') {
                        drugNoun = 'Ml';
                    }
                    else if (drug.type.toLowerCase() === 'inhaler') {
                        drugNoun = 'Puffs';
                    }
                    else if (drug.type.toLowerCase() === 'tablet') {
                        drugNoun = 'Tablets';
                    }
                    const morningDrugDetails = drug.morning.amount > 0
                        ? `${drug.morning.amount} ${drugNoun} of ${drug.name} by ${drug.morning.time}\n`
                        : '';
                    const afternoonDrugDetails = drug.afternoon.amount > 0
                        ? `${drug.afternoon.amount} ${drugNoun} of ${drug.name} by ${drug.afternoon.time}\n`
                        : '';
                    const nightDrugDetails = drug.night.amount > 0
                        ? `${drug.night.amount} ${drugNoun} of ${drug.name} by ${drug.night.time}\n`
                        : '';
                    const drugDetails = `${morningDrugDetails}${afternoonDrugDetails}${nightDrugDetails}To be taken ${drug.instructions}\n`;
                    text += drugDetails;
                }
            });
            if (text !==
                `Dear ${foundPatient.firstName}, these are your drugs for the day.\n`) {
                sendSMS(to, text);
            }
        }
    }));
});
exports.medicationReminder = medicationReminder;
function sendSMS(to, text) {
    const token = process.env.KUDI_SMS_TOKEN;
    const senderID = process.env.KUDI_SMS_SENDER_ID;
    const recipients = to;
    const message = text;
    const data = new FormData();
    data.append('token', token);
    data.append('senderID', senderID);
    data.append('recipients', recipients);
    data.append('message', message);
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://my.kudisms.net/api/corporate',
        data: data,
    };
    (0, axios_1.default)(config)
        .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
        .catch(function (error) {
        console.log(error);
    });
}
exports.sendSMS = sendSMS;
function calculateAge(dateOfBirth) {
    const dobParts = dateOfBirth.split('-');
    const dobYear = parseInt(dobParts[0]);
    const dobMonth = parseInt(dobParts[1]);
    const dobDay = parseInt(dobParts[2]);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - dobYear;
    if (currentDate.getMonth() < dobMonth - 1 ||
        (currentDate.getMonth() === dobMonth - 1 && currentDate.getDate() < dobDay)) {
        age--;
    }
    return age;
}
exports.calculateAge = calculateAge;
