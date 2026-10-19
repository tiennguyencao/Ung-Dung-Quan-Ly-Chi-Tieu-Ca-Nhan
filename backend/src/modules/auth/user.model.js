import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned by a normal query — defense in depth alongside the toJSON transform below
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },
    // Copied into every JWT at login. auth.middleware.js rejects a token whose
    // copy doesn't match the current value here — the one and only way this
    // increments is a successful password reset, which is how a compromised
    // token gets invalidated even though it hasn't naturally expired yet.
    tokenVersion: {
      type: Number,
      select: false,
      default: 0,
    },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.tokenVersion;
        return ret;
      },
    },
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);
