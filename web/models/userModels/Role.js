import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
}, { timestamps: true });

//module.exports = mongoose.model('Role', RoleSchema);
export default mongoose.model.Role || mongoose.model('Role', RoleSchema);
