import { Prescription } from '../Model/database'

export const updatePrescriptions = async () => {
  // const currentDate = new Date()
  Prescription.updateMany(
    {
      $or: [
        { 'drugs.end_date': { $gte: new Date() } },
        { drugs: { $exists: false } },
      ],
    },
    {
      $set: { active: true },
    }
  )
    .then(result => {
      console.log(`${result.modifiedCount} documents updated.`)
    })
    .catch(error => {
      console.error('Error updating documents:', error)
    })

  Prescription.updateMany(
    {
      $or: [
        { 'drugs.end_date': { $lt: new Date() } },
        { drugs: { $exists: false } },
      ],
    },
    {
      $set: { active: false },
    }
  )
    .then(result => {
      console.log(`${result.modifiedCount} documents updated.`)
    })
    .catch(error => {
      console.error('Error updating documents:', error)
    })
}
