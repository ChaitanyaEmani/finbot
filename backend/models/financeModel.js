import mongoose from "mongoose";

const financeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  income: { type: Number, required: true },
  expenses: { type: Number, required: true },
  savings: { type: Number, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

const Finance = mongoose.model("Finance", financeSchema);

export default Finance;
