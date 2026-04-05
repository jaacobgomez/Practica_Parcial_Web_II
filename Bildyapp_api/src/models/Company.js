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

const companySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    cif: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    address: {
      type: addressSchema,
      default: {},
    },
    logo: {
      type: String,
      default: "",
    },
    isFreelance: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Company = mongoose.model("Company", companySchema);

export default Company;