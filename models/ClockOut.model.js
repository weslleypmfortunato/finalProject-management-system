import mongoose from "mongoose";

const { Schema, model } = mongoose

const clockOutSchema = new Schema({
  clockOut: {
    type: Date,
    default: Date.now()
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })

export default model ('ClockOut', clockOutSchema)

