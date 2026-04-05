import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    number: { type: String, trim: true },
    postal: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    nif: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "guest"],
      default: "admin",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
      index: true,
    },
    verificationCode: {
      type: String,
      default: "",
    },
    verificationAttempts: {
      type: Number,
      default: 3,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },
    address: {
      type: addressSchema,
      default: {},
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.lastName}`.trim();
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);

export default User;