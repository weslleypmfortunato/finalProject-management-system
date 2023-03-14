import mongoose from "mongoose";

const { Schema, model } = mongoose 

const missingItemsSchema = new Schema ({
  workOrderType: {
    type: String,
    enum: ["local", "non-local", "wholesale"],
    required: true
  },
  missingProduct: {
    type: Schema.Types.ObjectId,
    ref: "Products",
    required: true
  }
}, {timestamps: true})

export default model ('MissingItems', missingItemsSchema)