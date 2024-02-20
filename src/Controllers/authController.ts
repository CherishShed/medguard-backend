import { Request, Response } from 'express'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { HealthWorker } from '../Model/database'
const authController = {
  loginUser: async (req: Request, res: Response) => {
    const { userName, password } = req.body

    try {
      const user = await HealthWorker.findOne({
        employeeNumber: (userName as string).toUpperCase(),
      })
      if (!user) {
        res
          .status(401)
          .json({ auth: false, message: 'User not found', user: null })
        return
      }
      const match = await compare(password, user.password)
      if (!match) {
        res
          .status(401)
          .json({ auth: false, message: 'Incorrrect Password', user: null })
        return
      }
      const accessToken = jwt.sign(
        {
          employeeNumber: user.employeeNumber,
          first_name: user.firstName,
          last_name: user.lastName,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: '3h' }
      )
      res.status(200).json({
        auth: true,
        message: 'Login successful',
        user: {
          employeeNumber: user.employeeNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          phoneNumber: user.phoneNumber,
        },
        accessToken,
      })
      return
    } catch (error) {
      if (error) {
        res.status(500).json({ errors: [{ msg: 'Error authenticating user' }] })
        return
      }
    }
  },
  //   registerUser: async (req: Request, res: Response) => {
  //     const { employeeNumber, password, firstName, lastName } = req.body
  //     const hashedPassword = await hash(password, 10)

  //     try {
  //       const existingUser = await HealthWorker.findOne({
  //         employeeNumber: employeeNumber,
  //       })
  //       if (!existingUser) {
  //         // HealthWorker.create({
  //         //   employeeNumber: employeeNumber,
  //         //   password: hashedPassword,
  //         //   first_name: firstName,
  //         //   last_name: lastName,
  //         // }).then(result => {
  //         //   res.status(200).json({ auth: true, user: result })
  //         // })
  //         res.status(200).json({ auth: true, hashedPassword })
  //       } else {
  //         res.status(409).json({ auth: false, message: 'User already exists' })
  //       }
  //     } catch (error) {
  //       res
  //         .status(500)
  //         .json({ auth: false, user: null, message: 'An error occured' })
  //     }
  //   },
  logout: async (req: Request, res: Response) => {
    req.logout(err => {
      if (err) {
        return res.status(500).json({ error: err, message: 'An error occured' })
      }
      return res.status(200).json({ message: 'Logout successful' })
    })
  },
}

export default authController
