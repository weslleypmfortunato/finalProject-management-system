import 'dotenv/config'
import { Router } from 'express'
import isAuthenticatedMiddleware from '../middlewares/isAuthenticatedMiddleware.js'
import Timesheet from '../models/Timesheet.model.js'
import * as timesheetRepository from '../repositories/timesheet.repositories.js'


const timesheetRouter = Router()

timesheetRouter.post('/timesheet', isAuthenticatedMiddleware, async (req, res) => {
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
            $gt: new Date(startDate),
            $lt: new Date(endDate),
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


timesheetRouter.get('/timesheet/:id', isAuthenticatedMiddleware, async (req, res) => {
  try {

    const { id } = req.params

    const timesheetId = await Timesheet.find({employeeId: id}).select({passwordHash: 0}).populate('employeeId', 'name employeeCode department fulltime')

    if (!timesheetId) {
      return res.status(404).json({message: "Timesheet not found!"})
    }
    return res.status(200).json(timesheetId)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
})

timesheetRouter.get('/my-timesheet', isAuthenticatedMiddleware, async (req, res) => {
  try {
    const myTimesheet = await Timesheet.find({ employeeId: req.user.id }).populate('employeeId', 'name employeeCode department fulltime')

    // myTimesheet.map(singleTimesheet => {

    //   if (singleTimesheet.employeeId.fulltime === true) {
    //     let workedHoursInMs = (((singleTimesheet.clockOut - singleTimesheet.clockIn) - 1800000) / 3600000).toString()

    //     let hour = parseInt(Number(workedHoursInMs))
    //     let minutes = Math.round((Number(workedHoursInMs)-hour) * 60)

    //     if (minutes >= 60) {
    //       hour += 1
    //       minutes -= 60
    //     }
    //     singleTimesheet.employeeId.department = `${hour}:${minutes}`

    //     if (singleTimesheet.employeeId.department.split(':')[1] === "0") {
    //       singleTimesheet.employeeId.department = `${hour}:00`
    //     } 

    //     if (singleTimesheet.employeeId.department.split(':')[1].length === 1 && singleTimesheet.employeeId.department.split(':')[1]!== "0" ) {
    //       singleTimesheet.employeeId.department = `${hour}:0${minutes}`
    //     }

        
    //     console.log("WORKED HOURS ==> ", workedHoursInMs)
    //     console.log("Horas ==> ", hour)
    //     console.log("Min ==> ", minutes)
    //     console.log("SINGLE ==> ", singleTimesheet)
    //     console.log("SINGLE.TEST ==> ", singleTimesheet.employeeId.department)
    //   }
    //   return singleTimesheet
    // })
    
   
    
    console.log("MY TIMESHEET ==> ", myTimesheet)
    return res.status(200).json(myTimesheet)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
})

export default timesheetRouter
