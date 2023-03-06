import Timesheet from '../models/Timesheet.model.js'

export async function create(id) {
  return await Timesheet.create({ employeeId: id, clockIn: Date.now(), clockOut: null })
}

export async function edit(id) {
  return await Timesheet.findByIdAndUpdate({ _id: id }, { clockOut: Date.now() }, {new: true})
}

export async function findByClockOut(id) {
  return await Timesheet.findOne({ employeeId: id, clockOut: null })
}