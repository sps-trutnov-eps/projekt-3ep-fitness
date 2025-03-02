const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10;

const weightEntrySchema = new mongoose.Schema({
  value: { type: Number, required: true, min: [0, 'Weight cannot be negative'] },
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    weights: [ weightEntrySchema ],
    dailyCalorieGoal: { type: Number, default: 2000 }
  },
  { timestamps: true }
);

// Pre-save hook to hash the user's password
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare candidate password with the hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);