import { Request, Response } from 'express'
import { Patient, HealthWorker } from '../Model/database'

const EmployeeController = {
  getPatientInfo: async (req: Request, res: Response) => {
    const { hospitalNumber } = req.query
    try {
      const foundPatient = await Patient.findOne(
        {
          hospitalNumber: hospitalNumber,
        },
        {
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
        }
      )
      if (foundPatient) {
        return res
          .status(200)
          .json({ patient: foundPatient, message: 'Found Record' })
      } else {
        return res
          .status(404)
          .json({ patient: null, message: 'Record does not exist' })
      }
    } catch (error) {
      return res.status(500).json({ error: error, message: 'An error occured' })
    }
  },
  getPatientMedication: async (req: Request, res: Response) => {
    const { hospitalNumber } = req.query
    try {
      const foundPatient = await Patient.findOne(
        {
          hospitalNumber: hospitalNumber,
        },
        {
          firstName: 1,
          lastName: 1,
          hospitalNumber: 1,
          gender: 1,
          phone_number: 1,
          lastUpdatedBy: 1,
        }
      ).populate({
        path: 'medications',
        populate: {
          path: 'lastUpdatedBy',
          select: 'firstName lastName -_id', // Select only firstName and lastName fields
        },
      })
      const currentDate = new Date().toISOString().split('T')[0] // Get current date in ISO format
      if (foundPatient) {
        let endedPrescriptions = await Patient.aggregate([
          { $match: { hospitalNumber } }, // Match the patient with the specified hospitalNumber
          { $unwind: '$medications' }, // Split the medications array into separate documents
          {
            $match: {
              'medications.end_date': { $lt: currentDate }, // Find medications where end_date is less than or equal to current date
            },
          },
          { $group: { _id: '$_id', medications: { $push: '$medications' } } }, // Regroup the medications into an array
        ])
        endedPrescriptions =
          endedPrescriptions.length > 0 ? endedPrescriptions[0].medications : []
        let activePrescriptions = await Patient.aggregate([
          { $match: { hospitalNumber } }, // Match the patient with the specified hospitalNumber
          { $unwind: '$medications' }, // Split the medications array into separate documents
          {
            $match: {
              'medications.end_date': { $gte: currentDate }, // Find medications where end_date is greater than current date
            },
          },
          { $group: { _id: '$_id', medications: { $push: '$medications' } } }, // Regroup the medications into an array
        ])

        activePrescriptions =
          activePrescriptions.length > 0
            ? activePrescriptions[0].medications
            : []
        return res.status(200).json({
          patient: foundPatient,
          message: 'Found Record',
          activePrescriptions,
          endedPrescriptions,
        })
      } else {
        return res
          .status(404)
          .json({ patient: null, message: 'Record does not exist' })
      }
    } catch (error) {
      return res.status(500).json({ error: error, message: 'An error occured' })
    }
  },
  getAllPatients: async (req: Request, res: Response) => {
    try {
      const allPatients = await Patient.find(
        {},
        {
          firstName: 1,
          lastName: 1,
          latestVitals: 1,
          hospitalNumber: 1,
          gender: 1,
          status: 1,
        }
      )

      allPatients.forEach(patient => {
        const latestVitals = patient.latestVitals
        const bloodPressure = latestVitals.blood_pressure
        const [systolic, diastolic] = bloodPressure.split('/').map(Number)
        if (
          systolic < 90 ||
          systolic > 140 ||
          diastolic < 60 ||
          diastolic > 90
        ) {
          // Abnormal blood pressure
          patient.status = 'bad'
        } else if (systolic < 120 || diastolic < 80) {
          // Warning for blood pressure
          patient.status = 'abnormal'
        } else {
          patient.status = 'good'
        }
        const heartRate = latestVitals.heart_beat
        if (heartRate < 60 || heartRate > 100) {
          // Abnormal heart rate
          patient.status = 'bad'
        } else if (heartRate < 70 || heartRate > 90) {
          if (patient.status != 'bad') {
            patient.status = 'abnormal'
          }
        } else {
          if (patient.status !== 'bad' && patient.status !== 'abnormal') {
            patient.status = 'good'
          }
        }
        patient.save()
      })
      return res.status(200).json({ patients: allPatients, success: true })
    } catch (error) {
      return res.status(500).json({ error: error, message: 'an error occured' })
    }
  },

  dashBoardStatistics: async (req: Request, res: Response) => {
    try {
      const allPatients = await Patient.find({}, { latestVitals: 1 })
      const medPatients = await Patient.find(
        {
          'medications.end_date': {
            $gte: new Date().toISOString().split('T')[0],
          },
        },
        { hospitalNumber: 1 }
      )

      const vitalCount = {
        warningCount: 0,
        badCount: 0,
      }
      allPatients.forEach(patient => {
        // Get the latest vitals for the patient
        const latestVitals = patient.latestVitals

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
