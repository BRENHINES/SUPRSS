import { api } from "./api";

export type ChatRoom = { id: string; name: string };
export type ChatMessage = {
  id: string | number;
  room_id: string;
  author_name: string;
  content: string;
  created_at: string; // ISO
};

export async function listRooms() {
  const { data } = await api.get<ChatRoom[]>("/api/chat/rooms");
  return data;
}

export async function createRoom(name: string) {
  const { data } = await api.post<ChatRoom>("/api/chat/rooms", { name });
  return data;
}

export async function listMessages(roomId: string) {
  const { data } = await api.get<ChatMessage[]>(`/api/chat/messages`, {
    params: { room_id: roomId },
  });
  return data;
}

export async function sendMessage(roomId: string, content: string) {
  const { data } = await api.post<ChatMessage>("/api/chat/messages", { room_id: roomId, content });
  return data;
}
