const express = require('express');
const router = express.Router();
const { Conversation, Message } = require('../models/Message');
const { protect } = require('../middleware/auth');

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name email avatar')
      .populate('lastMessage')
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Get single conversation with messages
// @access  Private
router.get('/conversations/:id', protect, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name email avatar phone');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    // Get messages
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name email avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        read: false
      },
      { read: true, readAt: new Date() }
    );

    // Update unread count
    conversation.unreadCount.set(req.user.id, 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        conversation,
        messages: messages.reverse()
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/messages/conversations
// @desc    Create new conversation
// @access  Private
router.post('/conversations', protect, async (req, res, next) => {
  try {
    const { participantId, message } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide participant ID'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, participantId]
      });
    }

    // Create initial message if provided
    if (message) {
      const newMessage = await Message.create({
        conversation: conversation._id,
        sender: req.user.id,
        content: message
      });

      conversation.lastMessage = newMessage._id;
      conversation.unreadCount.set(participantId, 
        (conversation.unreadCount.get(participantId) || 0) + 1
      );
      await conversation.save();
    }

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar')
      .populate('lastMessage');

    res.status(201).json({
      success: true,
      data: populatedConversation
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/messages/conversations/:id/messages
// @desc    Send message in conversation
// @access  Private
router.post('/conversations/:id/messages', protect, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    const { content, attachments } = req.body;

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user.id,
      content,
      attachments
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.participants.forEach(participant => {
      if (participant.toString() !== req.user.id) {
        conversation.unreadCount.set(
          participant.toString(),
          (conversation.unreadCount.get(participant.toString()) || 0) + 1
        );
      }
    });
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get unread message count
// @access  Private
router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      totalUnread += conv.unreadCount.get(req.user.id) || 0;
    });

    res.status(200).json({
      success: true,
      data: { unreadCount: totalUnread }
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/messages/conversations/:id
// @desc    Delete/Archive conversation
// @access  Private
router.delete('/conversations/:id', protect, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this conversation'
      });
    }

    // Soft delete - just mark as inactive
    conversation.isActive = false;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation archived successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
