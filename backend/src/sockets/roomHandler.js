class RoomHandler {
  constructor(io, pgPool, redisClient) {
    this.io = io;
    this.pool = pgPool;
    this.redis = redisClient;
  }

  initialize() {
    this.io.on('connection', (socket) => {
      // Room member joined
      socket.on('room_member_joined', async (data) => {
        const { roomId, userId, userName } = data;
        
        // Update active members in Redis
        await this.redis.sAdd(`room:${roomId}:active`, userId);
        
        // Get active member count
        const activeCount = await this.redis.sCard(`room:${roomId}:active`);
        
        // Broadcast to room
        this.io.to(roomId).emit('room_stats_updated', {
          activeMembers: activeCount
        });
      });

      // Room member left
      socket.on('room_member_left', async (data) => {
        const { roomId, userId } = data;
        
        // Remove from active members
        await this.redis.sRem(`room:${roomId}:active`, userId);
        
        // Get active member count
        const activeCount = await this.redis.sCard(`room:${roomId}:active`);
        
        // Broadcast to room
        this.io.to(roomId).emit('room_stats_updated', {
          activeMembers: activeCount
        });
      });

      // Get active members
      socket.on('get_active_members', async (data) => {
        const { roomId } = data;
        const activeMembers = await this.redis.sMembers(`room:${roomId}:active`);
        socket.emit('active_members', { roomId, members: activeMembers });
      });
    });
  }
}

module.exports = RoomHandler;
