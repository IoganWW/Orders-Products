import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store';
import { setActiveSessions, setConnectionStatus } from '@/store/slices/appSlice';
import { socketService } from '@/services/socket';

export const useSocket = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      dispatch(setConnectionStatus(true));
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      dispatch(setConnectionStatus(false));
    });

    socket.on('activeSessionsUpdate', (count: number) => {
      console.log('Sessions updated:', count);
      dispatch(setActiveSessions(count));
    });

    // Только обработка закрытия вкладки (не сворачивания)
    const handleBeforeUnload = () => {
      console.log('Page is being closed');
      socket.emit('beforeUnload');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Cleanup
      socket.off('connect');
      socket.off('disconnect');
      socket.off('activeSessionsUpdate');
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // НЕ отключаем сокет при размонтировании компонента
      // socketService.disconnect();
    };
  }, [dispatch]);

  return socketService.getSocket();
};