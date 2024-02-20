import { Request, Response } from 'express'
import { Patient, HealthWorker } from '../Model/database'

const EmployeeController = {
  getAllPatients: async (req: Request, res: Response) => {
    try {
      const allPatients = await Patient.find()
      return res.status(200).json({ patients: allPatients, success: true })
    } catch (error) {
      return res.status(500).json({ error: error, message: 'an error occured' })
    }
  },

  dashBoardStatistics: async (req: Request, res: Response) => {
    try {
      const allPatients = await Patient.find()
      const medPatients = await Patient.find({
        'medications.end_date': {
          $gte: new Date().toISOString().split('T')[0],
        },
      })

      const vitalCount = {
        warningCount: 0,
        badCount: 0,
      }
      allPatients.forEach(patient => {
        // Get the latest vitals for the patient
        const latestVitals = patient.vitals[patient.vitals.length - 1]

        // Check blood pressure
        const bloodPressure = latestVitals.blood_pressure
        const [systolic, diastolic] = bloodPressure.split('/').map(Number)

        if (
          systolic < 90 ||
          systolic > 140 ||
          diastolic < 60 ||
          diastolic > 90
        ) {
          // Abnormal blood pressure
          vitalCount.badCount++
        } else if (systolic < 120 || diastolic < 80) {
          // Warning for blood pressure
          vitalCount.warningCount++
        }

        // Check heart rate
        const heartRate = latestVitals.heart_beat
        if (heartRate < 60 || heartRate > 100) {
          // Abnormal heart rate
          vitalCount.badCount++
        } else if (heartRate < 70 || heartRate > 90) {
          // Warning for heart rate
          vitalCount.warningCount++
        }
      })
      return res.status(200).json({
        message: 'success',
        patientsNumber: allPatients.length,
        patientsOnMedication: medPatients.length,
        vitalCount: vitalCount,
      })
    } catch (error) {
      return res.status(500).json({ message: 'error', error: error })
    }
  },
}

export default EmployeeController
