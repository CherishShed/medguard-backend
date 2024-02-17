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
  linkClerkId: async (req: Request, res: Response) => {
    const { employeeNumber, clerkId } = req.query
    try {
      const foundEmployee = await HealthWorker.findOne({
        employeeNumber: employeeNumber,
      })
      if (!foundEmployee) {
        return res
          .status(404)
          .json({ message: 'User not found', success: false })
      } else {
        foundEmployee.clerkId = clerkId as string
        foundEmployee.save()
        return res.status(200).json({ message: 'success', success: true })
      }
    } catch (error) {
      return res.status(500).json({ message: 'error', error: error })
    }
  },
}

export default EmployeeController
