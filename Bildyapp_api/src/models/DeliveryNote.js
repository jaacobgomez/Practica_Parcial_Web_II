import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const deliveryNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    format: {
      type: String,
      enum: ["material", "hours"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    workDate: {
      type: Date,
      required: true,
      index: true,
    },

    material: {
      type: String,
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      trim: true,
      default: "",
    },

    hours: {
      type: Number,
      default: 0,
      min: 0,
    },
    workers: {
      type: [workerSchema],
      default: [],
    },

    signed: {
      type: Boolean,
      default: false,
      index: true,
    },
    signedAt: {
      type: Date,
      default: null,
    },
    signatureUrl: {
      type: String,
      default: "",
    },
    pdfUrl: {
      type: String,
      default: "",
    },

    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

deliveryNoteSchema.index({ company: 1, project: 1 });
deliveryNoteSchema.index({ company: 1, client: 1 });
deliveryNoteSchema.index({ company: 1, format: 1 });
deliveryNoteSchema.index({ company: 1, signed: 1 });
deliveryNoteSchema.index({ company: 1, workDate: -1 });

const DeliveryNote = mongoose.model("DeliveryNote", deliveryNoteSchema);

export default DeliveryNote;