import mongoose from "mongoose";

const { Schema, model } = mongoose

const clockInSchema = new Schema({
  clockIn: {
    type: Date,
    default: Date.now()
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "Employee"
  }, 
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })

export default model ('ClockIn', clockInSchema)