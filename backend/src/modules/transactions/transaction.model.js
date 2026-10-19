import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense',
      },
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      // always stored positive — direction comes from `type`, never a signed number (BR-02)
      min: [0.01, 'Amount must be greater than 0'],
      // Unbounded above meant a data-entry typo (an extra zero or two) had
      // nothing catching it, and enough zeros eventually risks floating-point
      // precision loss in sums. 10 billion VND is far beyond any realistic
      // personal transaction while staying well inside safe-integer range.
      max: [10_000_000_000, 'Amount must be less than 10,000,000,000'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
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

transactionSchema.index({ userId: 1, date: -1 }); // default sorted list (UC-09)
transactionSchema.index({ userId: 1, categoryId: 1 }); // category filter (UC-09)
transactionSchema.index({ userId: 1, type: 1, date: -1 }); // type filter + budget/stats aggregation

export default mongoose.model('Transaction', transactionSchema);
