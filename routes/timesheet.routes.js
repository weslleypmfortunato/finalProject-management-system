import 'dotenv/config'
import { Router } from 'express'
import isAuthenticatedMiddleware from '../middlewares/isAuthenticatedMiddleware.js'
import Timesheet from '../models/Timesheet.model.js'
import * as timesheetRepository from '../repositories/timesheet.repositories.js'

const timesheetRouter = Router()

//CODIGO QUE TRAZ O RESULTADO POR DIA SEM SOMAR OS DIAS
// timesheetRouter.get('/timesheet', async (req, res) => {
//   try {
//     const clockInOutTimesheet = await Timesheet.find().populate('employeeId', 'name employeeCode department fulltime')

//     for (let i = 0; i <= clockInOutTimesheet.length; i++) {
//       if (clockInOutTimesheet[i].employeeId._id === clockInOutTimesheet[i].employeeId._id) {
//         const ttlHrs = (clockInOutTimesheet[i].clockOut - clockInOutTimesheet[i].clockIn) + (clockInOutTimesheet[i].clockOut - clockInOutTimesheet[i].clockIn)
//         return ttlHrs
//       } else {
//         (clockInOutTimesheet[i].clockOut - clockInOutTimesheet[i].clockIn)
//         return ttlHrs
//       }
//     }
    
//     console.log("CLOCK ==>", clockInOutTimesheet )

//     return res.status(200).json(clockInOutTimesheet)
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({message: "Error code 1001"})
//   }
// })


//** ESSE FUNCIONA MAS NÃO CONSIGO POPULAR O EMPLOYEEID
timesheetRouter.get('/timesheet', async (req, res) => {

  try {
    const clockInOutTimesheet = await Timesheet.aggregate([

      { $group: {_id: '$employeeId', totalHours: { $sum: { $divide: [ { $subtract: ['$clockOut', '$clockIn'] }, 1000 * 60 * 60 ] } }, name: { $first: '$employee.employeeId.name' }, employeeCode: { $first: '$employee.employeeId.employeeCode' }, department: { $first: '$employee.employeeId.department' }, fulltime: { $first: '$employee.employeeId.fulltime' },   
     }, 
    },

    {
      $project: {
        _id: 1,
        totalHours: 1,
        name: 1,
        employeeCode: 1,
        department: 1,
        fulltime: 1
      }
    }
  ])

  console.log("GET ==> ",clockInOutTimesheet)

  return res.status(200).json(clockInOutTimesheet);
} catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Server Error' });
}
});
//** ESSE DE CIMA FUNCIONA MAS NÃO CONSIGO POPULAR O EMPLOYEEID


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

timesheetRouter.get('/my-timesheet', isAuthenticatedMiddleware, async (req, res) => {
  try {
    const myTimesheet = await Timesheet.find({ user: req.user.id }).populate('employeeId', 'name employeeCode department fulltime')
    console.log("MY TIMESHEET ==> ", myTimesheet)
    return res.status(200).json(myTimesheet)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
})



export default timesheetRouter

// 1. User loga e cria uma nova timesheet
// 2. Timesheet tem clock In? 
    // ==> NÃO: adiciona clockIn
    // ==> SIM: adiciona só clockOut



// code para quando tinha duas models

//antigo get quando tinha duas models 
// timesheetRouter.get('/timesheet', async (req, res) => {
//   try {
//     const clockInOutTimesheet = await ClockIn.find().populate('employeeId', 'name employeeCode department')
//     const clockOutTimesheet = await ClockOut.find().populate('employeeId', 'name employeeCode department')
//     let concatenateClockInOut = clockInTimesheet.concat(clockOutTimesheet)
//     let hash = {}
//     for (let i = 0; i < concatenateClockInOut.length; i++) {
//       console.log("HASH ==> ", concatenateClockInOut[i].employeeId.name)
//       if (!hash[concatenateClockInOut[i].employeeId.name]) {
//         hash[concatenateClockInOut[i].employeeId.name] = []
//       }
//       if (concatenateClockInOut[i].clockOut) {
//         hash[concatenateClockInOut[i].employeeId.name].clockOut.push(concatenateClockInOut[i].clockOut)
//       }
//       if (concatenateClockInOut[i].clockIn) {
//         hash[concatenateClockInOut[i].employeeId.name].clockIn(concatenateClockInOut[i].clockIn)
//       }
//     }
//     console.log("HASH" , hash)

//     return res.status(200).json(concatenateClockInOut)
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({message: "Error code 1001"})
//   }
// })


// let model = type === "clockIn" ? ClockIn : ClockOut
// await model.create({ employeeId: req.user.id })
// return res.status(201).json({message: `${ type } registered succesfully!`})
// } catch (error) {
// console.log(error)

 // let hash = {}
    // for (let i = 0; i < clockInOutTimesheet.length; i++) {
    //   console.log("HASH ==> ", clockInOutTimesheet[i].employeeId.name)
    //   if (clockInOutTimesheet[i].clockOut) {
    //     hash[clockInOutTimesheet[i].employeeId.name].clockOut.push(clockInOutTimesheet[i].clockOut)
    //   }
    //   if (clockInOutTimesheet[i].clockIn) {
    //     hash[clockInOutTimesheet[i].employeeId.name].clockIn(clockInOutTimesheet[i].clockIn)
    //   }
    // }
    // console.log("HASH" , hash)



    //CODIGO QUE O FELIPE ESTAVA ME AJUDANDO
    // const date = Date(req.params.clockIn)

    // console.log("DAYS ==> ", date)
    // console.log("DAYS toISOString ==> ", new Date(req.params.clockIn).toISOString())

    // const clockInOutTimesheet = await Timesheet.aggregate([
    //   { $match: { $or: [{ clockIn: { $gte: new Date(req.params.clockIn).toISOString(), $lte: new Date(req.params.clockOut).toISOString() } }, { clockOut: { $gte: new Date(req.params.clockIn).toISOString(), $lte: new Date(req.params.clockOut).toISOString() } }] } },
    //   { $addFields: { dayIn: { $dateToString: { format: '%Y-%m-%d', date: '$clockIn' } } } },
    //   { $addFields: { dayOut: { $dateToString: { format: '%Y-%m-%d', date: '$clockOut' } } } },
    // ],
    // function(err, results) { if (err) { console.error(err); return; } console.log(results); });

    // { $group: { _id: '$employeeId' }}