import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null = overall monthly budget (BR-05)
    },
    limitAmount: {
      type: Number,
      required: [true, 'Limit amount is required'],
      min: [0.01, 'Limit amount must be greater than 0'],
      max: [10_000_000_000, 'Limit amount must be less than 10,000,000,000'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Enforces BR-05 at the database level: at most one budget per (user, month,
// category) — including at most one overall budget per month, since two overall
// budgets for the same month both have categoryId: null and collide here.
budgetSchema.index({ userId: 1, month: 1, categoryId: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
