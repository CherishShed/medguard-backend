import { Request, Response } from 'express'
import { Patient, Prescription } from '../Model/database'
import { userType } from './authController'
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
  getPatientPrescriptions: async (req: Request, res: Response) => {
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
        path: 'lastUpdatedBy',
        select: 'firstName lastName -_id', // Select only firstName and lastName fields
      }) // Get current date in ISO format
      if (foundPatient) {
        // Find all prescriptions for the given patient
        const prescriptions = await Prescription.find({
          patient: hospitalNumber,
        })

        // Separate prescriptions into active and inactive categories
        const activePrescriptions = prescriptions.filter(
          prescription => prescription.active === true
        )
        const endedPrescriptions = prescriptions.filter(
          prescription => prescription.active === false
        )

        // Sort active prescriptions by prescriptionDate in descending order
        activePrescriptions.sort((a, b) => {
          const dateA = new Date(a.prescriptionDate).getTime()
          const dateB = new Date(b.prescriptionDate).getTime()
          return dateB - dateA
        })

        // Sort inactive prescriptions by prescriptionDate in descending order
        endedPrescriptions.sort((a, b) => {
          const dateA = new Date(a.prescriptionDate).getTime()
          const dateB = new Date(b.prescriptionDate).getTime()
          return dateB - dateA
        })
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
      return res.status(200).json({ patients: allPatients, success: true })
    } catch (error) {
      return res.status(500).json({ error: error, message: 'an error occured' })
    }
  },

  dashBoardStatistics: async (req: Request, res: Response) => {
    try {
      const allPatients = await Patient.find({}, { status: 1 })
      const medPatients = await Prescription.find(
        {
          active: true,
        },
        { active: 1 }
      )

      const vitalCount = {
        warningCount: 0,
        badCount: 0,
      }
      allPatients.forEach(patient => {
        // Get the latest vitals for the patient
        const status = patient.status
        if (status === 'bad') {
          vitalCount.badCount++
        } else if (status === 'abnormal') {
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
  addMedication: async (req: Request, res: Response) => {
    const { prescriptionId } = req.query
    const medData = req.body
    try {
      const updatedPrescription = await Prescription.findOneAndUpdate(
        { id: prescriptionId }, // Find the prescription by its ID
        {
          $push: { drugs: medData },
          $set: {
            lastUpdatedBy: (req.user as userType)._id,
          },
        }
        // Push the new medication into the drugs array
      )

      if (!updatedPrescription) {
        return res
          .status(404)
          .json({ message: 'Invalid Prescription', success: false })
      }
      if (new Date(medData.end_date) > new Date(Date.now())) {
        updatedPrescription.active = true
      }
      const foundPatient = await Patient.findOne(
        {
          hospitalNumber: updatedPrescription.patient,
        },
        { lastUpdatedBy: 1 }
      )
      foundPatient!.lastUpdatedBy = (req.user as userType)._id
      foundPatient!.save()
      return res
        .status(200)
        .json({ message: 'Added Medication Successfully', success: true })
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'An error occurred', success: false, error })
    }
  },
  addPrescription: async (req: Request, res: Response) => {
    try {
      const { prescriptionDate, drugs, hospitalNumber } = req.body
      // Create a new prescription document
      const newPrescription = new Prescription({
        prescriptionDate,
        drugs,
        patient: hospitalNumber,
        lastUpdatedBy: (req.user as userType)._id,
      })
      const foundPatient = await Patient.findOne(
        {
          hospitalNumber: hospitalNumber,
        },
        { lastUpdatedBy: 1 }
      )
      foundPatient!.lastUpdatedBy = (req.user as userType)._id
      foundPatient!.save()
      // Save the new prescription to the database
      await newPrescription.save()

      res.status(201).json({
        message: 'Prescription created successfully',
        prescription: newPrescription,
      })
    } catch (error) {
      console.error('Error creating prescription:', error)
      res
        .status(500)
        .json({ error: 'An error occurred while creating prescription' })
    }
  },
  getPatientVitals: async (req: Request, res: Response) => {
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
          vitals: 1,
          status: 1,
        }
      )
      if (!foundPatient) {
        return res
          .status(404)
          .json({ message: 'Patient not found', success: false })
      }
      return res
        .status(200)
        .json({ patientDetails: foundPatient, success: true })
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'An error occurred', success: false })
    }
  },
  getSinglePrescription: async (req: Request, res: Response) => {
    const { prescriptionId } = req.query
    try {
      const prescription = await Prescription.findById(prescriptionId).populate(
        {
          path: 'lastUpdatedBy',
          select: 'firstName lastName -_id', // Select only firstName and lastName fields
        }
      )
      if (!prescription) {
        return res
          .status(404)
          .json({ message: 'Invalid Prescription', success: false })
      }
      return res.status(200).json({ prescription, success: true })
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'An error occurred', success: false, error })
    }
  },
}
export default EmployeeController
