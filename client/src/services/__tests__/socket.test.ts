// client/src/services/__tests__/socket.test.ts
import { socketService } from '../socket';
import { io } from 'socket.io-client';

// jest.mock('socket.io-client') уже настроен в setupTests.ts
const mockedIo = io as jest.Mock;

describe('SocketService', () => {
  beforeEach(() => {
    // Сбрасываем сервис перед каждым тестом для изоляции
    socketService.disconnect();
    // Наш новый мок localStorage имеет работающий метод clear
    localStorage.clear(); 
    mockedIo.mockClear();
  });

  it('should create a new connection with token from localStorage', () => {
    localStorage.setItem('token', 'socket-token');
    socketService.connect();

    expect(io).toHaveBeenCalledTimes(1);
    // Теперь localStorage.getItem вернет 'socket-token', и тест пройдет
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      auth: { token: 'socket-token' }
    }));
  });

  it('should create a connection with token as null if not in localStorage', () => {
    socketService.connect();
    
    expect(io).toHaveBeenCalledTimes(1);
    // Теперь localStorage.getItem вернет null, и тест пройдет
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      auth: { token: null }
    }));
  });

  it('should return the same socket instance on multiple connect calls', () => {
    const socket1 = socketService.connect();
    const socket2 = socketService.connect();

    expect(io).toHaveBeenCalledTimes(1);
    expect(socket1).toBe(socket2);
  });

  it('should disconnect the socket', () => {
    const socket = socketService.connect();
    socketService.disconnect();

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(socketService.getSocket()).toBeNull();
  });

  it('should return correct connection status', () => {
    expect(socketService.isConnected()).toBe(false);
    
    const socket = socketService.connect();
    (socket as any).connected = true;
    expect(socketService.isConnected()).toBe(true);

    socketService.disconnect();
    expect(socketService.isConnected()).toBe(false);
  });
});