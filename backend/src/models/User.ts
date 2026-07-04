import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    country: {
      type: String,
      required: true,
      default: 'United States',
    },
    monthlyIncome: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model('User', UserSchema);
export default User;
