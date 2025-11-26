import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Message content cannot exceed 5000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation',
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  messages: [messageSchema],
  context: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, updatedAt: -1 });

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Middleware to limit messages array size
chatSchema.pre('save', function(next) {
  // Keep only last 100 messages to prevent excessive DB size
  if (this.messages.length > 100) {
    this.messages = this.messages.slice(-100);
  }
  next();
});

// Ensure virtuals are included in JSON
chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

export default mongoose.models.Chat || mongoose.model('Chat', chatSchema);