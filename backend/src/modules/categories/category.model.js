import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = system default category, visible to every user
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    icon: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: '#6B7280',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex code'],
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

// Enforces BR-03/E9 at the database level: no two categories with the same name
// for the same user, including at most one default with a given name (both share
// userId: null, so they collide on this key exactly like two customs would).
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
