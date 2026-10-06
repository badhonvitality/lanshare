import { create } from 'zustand';

interface RoomState {
  roomPin: string | null;
  roomId: string | null;
  isHost: boolean;
  viewersCount: number;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: string | null;
  quality: 'source' | '1080p' | '720p' | '480p';
  fps: 15 | 30 | 60;
  streamMode: 'source' | 'smooth' | 'auto';
  setRoomPin: (pin: string | null) => void;
  setRoom: (id: string | null, isHost: boolean) => void;
  setViewersCount: (count: number) => void;
  setConnectionState: (state: RoomState['connectionState']) => void;
  setError: (error: string | null) => void;
  setQuality: (quality: RoomState['quality']) => void;
  setFps: (fps: RoomState['fps']) => void;
  setStreamMode: (mode: RoomState['streamMode']) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomPin: null,
  roomId: null,
  isHost: false,
  viewersCount: 0,
  connectionState: 'disconnected',
  error: null,
  quality: '1080p',
  fps: 30,
  streamMode: 'auto',
  setRoomPin: (pin) => set({ roomPin: pin }),
  setRoom: (id, isHost) => set({ roomId: id, isHost }),
  setViewersCount: (count) => set({ viewersCount: count }),
  setConnectionState: (state) => set({ connectionState: state }),
  setError: (error) => set({ error }),
  setQuality: (quality) => set({ quality }),
  setFps: (fps) => set({ fps }),
  setStreamMode: (mode) => set({ streamMode: mode }),
}));
