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
exports.updatePrescriptions = void 0;
const database_1 = require("../Model/database");
const updatePrescriptions = () => __awaiter(void 0, void 0, void 0, function* () {
    database_1.Prescription.updateMany({
        $or: [
            { 'drugs.end_date': { $gte: new Date() } },
            { drugs: { $exists: false } },
        ],
    }, {
        $set: { active: true },
    })
        .then(result => {
        console.log(`${result.modifiedCount} documents updated.`);
    })
        .catch(error => {
        console.error('Error updating documents:', error);
    });
    database_1.Prescription.updateMany({
        $or: [
            { 'drugs.end_date': { $lt: new Date() } },
            { drugs: { $exists: false } },
        ],
    }, {
        $set: { active: false },
    })
        .then(result => {
        console.log(`${result.modifiedCount} documents updated.`);
    })
        .catch(error => {
        console.error('Error updating documents:', error);
    });
});
exports.updatePrescriptions = updatePrescriptions;
