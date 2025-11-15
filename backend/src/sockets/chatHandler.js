const { ObjectId } = require('mongodb');

class ChatHandler {
  constructor(io, mongoClient, redisClient) {
    this.io = io;
    this.mongo = mongoClient;
    this.redis = redisClient;
    this.messagesCollection = mongoClient.db().collection('messages');
    this.directMessagesCollection = mongoClient.db().collection('direct_messages');
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join room
      socket.on('join_room', async (data) => {
        const { roomId, userId, userName } = data;
        socket.join(roomId);
        
        // Store user-socket mapping
        await this.redis.set(`user:${userId}:socket`, socket.id, { EX: 86400 });
        await this.redis.set(`socket:${socket.id}:user`, userId, { EX: 86400 });
        
        // Notify others
        socket.to(roomId).emit('user_joined', {
          userId,
          userName,
          timestamp: new Date()
        });

        console.log(`User ${userId} joined room ${roomId}`);
      });

      // Send message to room
      socket.on('send_message', async (data) => {
        try {
          const { roomId, userId, userName, userAvatar, content, messageType, attachments } = data;
          
          // Save to MongoDB
          const message = {
            roomId,
            senderId: userId,
            senderName: userName,
            senderAvatar: userAvatar,
            content,
            messageType: messageType || 'text',
            attachments: attachments || [],
            reactions: [],
            isEdited: false,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const result = await this.messagesCollection.insertOne(message);
          message._id = result.insertedId;
          
          // Broadcast to room
          this.io.to(roomId).emit('new_message', message);
          
          console.log(`Message sent to room ${roomId} by user ${userId}`);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Send direct message
      socket.on('send_direct_message', async (data) => {
        try {
          const { senderId, receiverId, senderName, content, messageType } = data;
          
          const conversationId = [senderId, receiverId].sort().join('_');
          
          const message = {
            conversationId,
            participants: [senderId, receiverId],
            senderId,
            senderName,
            content,
            messageType: messageType || 'text',
            isRead: false,
            createdAt: new Date()
          };
          
          const result = await this.directMessagesCollection.insertOne(message);
          message._id = result.insertedId;
          
          // Send to both users
          const receiverSocket = await this.redis.get(`user:${receiverId}:socket`);
          if (receiverSocket) {
            this.io.to(receiverSocket).emit('new_direct_message', message);
          }
          socket.emit('new_direct_message', message);
          
          console.log(`Direct message sent from ${senderId} to ${receiverId}`);
        } catch (error) {
          console.error('Error sending direct message:', error);
          socket.emit('error', { message: 'Failed to send direct message' });
        }
      });

      // Typing indicator
      socket.on('typing', (data) => {
        const { roomId, userId, userName, isTyping } = data;
        socket.to(roomId).emit('user_typing', { userId, userName, isTyping });
      });

      // Message reaction
      socket.on('add_reaction', async (data) => {
        try {
          const { messageId, userId, emoji } = data;
          
          await this.messagesCollection.updateOne(
            { _id: new ObjectId(messageId) },
            {
              $push: {
                reactions: { userId, emoji, timestamp: new Date() }
              }
            }
          );
          
          const message = await this.messagesCollection.findOne({ _id: new ObjectId(messageId) });
          this.io.to(message.roomId).emit('message_updated', message);
        } catch (error) {
          console.error('Error adding reaction:', error);
        }
      });

      // Edit message
      socket.on('edit_message', async (data) => {
        try {
          const { messageId, userId, newContent } = data;
          
          const result = await this.messagesCollection.findOneAndUpdate(
            { _id: new ObjectId(messageId), senderId: userId },
            {
              $set: {
                content: newContent,
                isEdited: true,
                updatedAt: new Date()
              }
            },
            { returnDocument: 'after' }
          );
          
          if (result.value) {
            this.io.to(result.value.roomId).emit('message_updated', result.value);
          }
        } catch (error) {
          console.error('Error editing message:', error);
        }
      });

      // Delete message
      socket.on('delete_message', async (data) => {
        try {
          const { messageId, userId } = data;
          
          const result = await this.messagesCollection.findOneAndUpdate(
            { _id: new ObjectId(messageId), senderId: userId },
            {
              $set: {
                content: 'This message was deleted',
                isDeleted: true,
                updatedAt: new Date()
              }
            },
            { returnDocument: 'after' }
          );
          
          if (result.value) {
            this.io.to(result.value.roomId).emit('message_updated', result.value);
          }
        } catch (error) {
          console.error('Error deleting message:', error);
        }
      });

      // Leave room
      socket.on('leave_room', async (data) => {
        const { roomId, userId, userName } = data;
        socket.leave(roomId);
        socket.to(roomId).emit('user_left', { userId, userName });
        console.log(`User ${userId} left room ${roomId}`);
      });

      // Disconnect
      socket.on('disconnect', async () => {
        const userId = await this.redis.get(`socket:${socket.id}:user`);
        if (userId) {
          await this.redis.del(`user:${userId}:socket`);
          await this.redis.del(`socket:${socket.id}:user`);
        }
        console.log('User disconnected:', socket.id);
      });
    });
  }
}

module.exports = ChatHandler;
