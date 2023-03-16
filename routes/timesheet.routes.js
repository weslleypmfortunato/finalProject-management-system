import 'dotenv/config'
import { Router } from 'express'
import isAuthenticatedMiddleware from '../middlewares/isAuthenticatedMiddleware.js'
import clockInOutMiddleware from '../middlewares/clockInOutMiddleware.js'
import Timesheet from '../models/Timesheet.model.js'
import * as timesheetRepository from '../repositories/timesheet.repositories.js'

const timesheetRouter = Router()

timesheetRouter.post('/timesheet/clockin-clockout', clockInOutMiddleware, async (req, res) => {
  try {
    const noClockOut = await timesheetRepository.findByClockOut(req.user.id)
    if (noClockOut) {
      const newTimesheet = await timesheetRepository.edit(noClockOut._id)
      return res.status(200).json(newTimesheet)
    }

    const newTimesheet = await timesheetRepository.create(req.user.id)

    if (newTimesheet) {
      return res.status(201).json({message: "New timesheet created successfully"})
    }

  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Error code 1003"})
  }
})

timesheetRouter.get('/timesheet', async (req, res) => {
  const {startDate, endDate} = req.query
  try {
    if (!startDate || !endDate) {
      return res.status(400).json({message: "Missing start or end date"})
    }
    const clockInOutTimesheet = await Timesheet.aggregate([
      {
        $match: {
          clockIn: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: "$employeeId",
          count: {
            $sum: 1
          },
          totalHours: {
            $sum: {
              $divide: [{
                $subtract: ["$clockOut", "$clockIn"]
              }, 1000 * 60 * 60 ]      
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $first: "$employee"
              },
              "$$ROOT"
            ]
          }
        }
      }, 
      {
        $unset: "employee"
      },
      {
        $sort: {
          department: 1 , name: 1
        }
      }
  ]) 

  clockInOutTimesheet.map(singleClockInOutTimesheet => { 

      if (singleClockInOutTimesheet.fulltime === true) {
        singleClockInOutTimesheet.totalHours -= 0.5 * singleClockInOutTimesheet.count 
        let hour = parseInt(Number(singleClockInOutTimesheet.totalHours))
        let minutes = Math.round((Number(singleClockInOutTimesheet.totalHours)-hour) * 60)
        if (minutes >= 60) {
          hour += 1
          minutes -= 60
        }
        singleClockInOutTimesheet.totalHours = `${hour}:${minutes}`

        if (singleClockInOutTimesheet.totalHours.split(':')[1] === "0") {
          singleClockInOutTimesheet.totalHours = `${hour}:00`
        } 

        if (singleClockInOutTimesheet.totalHours.split(':')[1].length === 1 && singleClockInOutTimesheet.totalHours.split(':')[1]!== "0" ) {
          singleClockInOutTimesheet.totalHours = `${hour}:0${minutes}`
        }

      } else if (singleClockInOutTimesheet.fulltime === false) {
        singleClockInOutTimesheet.totalHours += 0.25 * singleClockInOutTimesheet.count
        let hour = parseInt(Number(singleClockInOutTimesheet.totalHours))
        let minutes = Math.round((Number(singleClockInOutTimesheet.totalHours)-hour) * 60)
        singleClockInOutTimesheet.totalHours = `${hour}:${minutes}`

        if (singleClockInOutTimesheet.totalHours.split(':')[1] === "0") {
          singleClockInOutTimesheet.totalHours = `${hour}:00`
        }

        if (singleClockInOutTimesheet.totalHours.split(':')[1].length === 1 && singleClockInOutTimesheet.totalHours.split(':')[1]!== "0" ) {
          singleClockInOutTimesheet.totalHours = `${hour}:0${minutes}`
        }
      } 
      return singleClockInOutTimesheet
  })
  return res.status(200).json(clockInOutTimesheet);
} catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Server Error' });
}
});

timesheetRouter.get('/timesheet/:id/', isAuthenticatedMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const {startDate, endDate} = req.query

    let query = { employeeId: id }

    if (startDate && endDate) {
      query.clockIn = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const timesheetId = await Timesheet.find(query).sort({clockIn: - 1}).select({passwordHash: 0}).populate('employeeId', 'name employeeCode department fulltime status')

    if (!timesheetId) {
      return res.status(404).json({message: "Timesheet not found!"})
    }
    return res.status(200).json(timesheetId)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
})

timesheetRouter.put('/timesheet/approval', isAuthenticatedMiddleware, async (req, res) => {
  try {
    let { ids } = req.body
    const timesheetApproval = await Timesheet.updateMany({_id: {$in: ids}, status: false }, {status: true}, )
    return res.status(200).json(timesheetApproval)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal server error. Try to update the page!"})
  }
})

timesheetRouter.get('/timesheet/employee/:id', isAuthenticatedMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const timesheetId = await Timesheet.findById(id).select({passwordHash: 0})

    if (!timesheetId) {
      return res.status(404).json({message: "User not found!"})
    }
    return res.status(200).json(timesheetId)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
})

timesheetRouter.put('/timesheet/edit/:id', async (req, res) => {
  try {
    const payload = req.body
    const { id } = req.params

    const updateTimesheet = await Timesheet.findByIdAndUpdate({_id: id}, payload, {new: true})
    return res.status(200).json(updateTimesheet)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal server error. Update the page and try again. Remember to keep the same date format."})
  }
})

timesheetRouter.get('/my-timesheet', isAuthenticatedMiddleware, async (req, res) => {
  try {
    const myTimesheet = await Timesheet.find({ employeeId: req.user.id }).sort({clockIn: - 1}).populate('employeeId', 'name employeeCode department fulltime')
    return res.status(200).json(myTimesheet)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
})

export default (timesheetRouter)
