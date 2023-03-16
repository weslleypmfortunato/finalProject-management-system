import mongoose from "mongoose";

const { Schema, model } = mongoose 

const workOrderSchema = new Schema ({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Products',
    required: true
  },
  quantities: {
    type: Number,
    required: true,
    
  },
}, {timestamps: true})

export default model ('WorkOrders', workOrderSchema)