import mongoose from "mongoose";

const { Schema, model } = mongoose

const timesheetSchema = new Schema({
  clockIn: Date,
  clockOut: Date,
  status: {
    type: Boolean,
    default: false
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }, 
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })

export default model ('Timesheet', timesheetSchema)
