import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

  connect(): Socket {
    // Если уже есть соединение, возвращаем его
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    // Создаем новое соединение только если его нет
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        forceNew: false, // Не создавать новое соединение принудительно
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      console.log('New socket connection created');
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }
}

// Экспортируем единственный экземпляр
export const socketService = new SocketService();



