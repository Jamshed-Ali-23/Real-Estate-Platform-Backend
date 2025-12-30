const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: String,
    enum: ['client', 'agent'],
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [5000, 'Message cannot be more than 5000 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

const conversationSchema = new mongoose.Schema({
  client: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    avatar: String
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  propertyTitle: String,
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    content: String,
    sender: String,
    timestamp: Date
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'spam'],
    default: 'active'
  },
  // Link to lead if exists
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  }
}, {
  timestamps: true
});

// Update last message when a new message is added
messageSchema.post('save', async function() {
  const Conversation = mongoose.model('Conversation');
  await Conversation.findByIdAndUpdate(this.conversation, {
    lastMessage: {
      content: this.content,
      sender: this.sender,
      timestamp: this.createdAt
    },
    $inc: { unreadCount: this.sender === 'client' ? 1 : 0 }
  });
});

const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Message, Conversation };
