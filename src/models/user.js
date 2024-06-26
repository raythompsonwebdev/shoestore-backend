import { Schema, model, models } from "mongoose";
import validator from "validator";

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Full name is required"],
    minLength: [4, "Full name should be at least 4 characters long"],
    //maxLength: [30, 'Full name should be less than 30 characters'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    minLength: [4, "Full name should be at least 2 characters long"],
    lowercase: true,
    trim: true,
    validate: (value) => {
      return validator.isEmail(value);
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [12, "Password should be at least 12 characters long"],
    select: false,
  },
  date: {
    type: String,
    default: Date.now,
  },
  image: {
    type: String,
    required: true,
  },
  cartitems: [
    {
      type: [String],
      required: true,
    },
  ],
});

const User = models.User || model("User", UserSchema);

export default User;
