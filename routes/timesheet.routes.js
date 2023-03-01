import 'dotenv/config'
import { Router } from 'express'
import isAuthenticatedMiddleware from '../middlewares/isAuthenticatedMiddleware.js'
import ClockIn from '../models/ClockIn.model.js' 
import ClockOut from '../models/ClockOut.model.js'


const timesheetRouter = Router()

timesheetRouter.get('/timesheet', async (req, res) => {
  try {
    const clockInTimesheet = await ClockIn.find().populate('employeeId')
    const clockOutTimesheet = await ClockOut.find().populate('employeeId')
    return res.status(200).json(clockInTimesheet.concat(clockOutTimesheet))
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Error code 1001"})
  }
})

timesheetRouter.post('/timesheet', isAuthenticatedMiddleware, async (req, res) => {

  const { type } = req.body
  // pensar na query que valida se ja tem clockin/out no dia
  try {

    let model = type === "clockIn" ? ClockIn : ClockOut
    await model.create({ employeeId: req.user.id })
    return res.status(201).json({message: `${ type } registered succesfully!`})
  } catch (error) {
    console.log(error)

    if (error.message === "Clock In already registered") {
      return res.status(409).json({message: "Error code 1002"})
    }
    return res.status(500).json({message: "Error code 1003"})
  }
})





export default timesheetRouter
