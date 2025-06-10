import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatModel = mongoose.model('Chat', chatSchema);

export default chatModel;
