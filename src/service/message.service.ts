import Axios from "@/lib/axiosInstance";

const BASE = "conversations"; // laisse vide, l'instance Axios a déjà la baseURL

const getConversations = async (): Promise<Conversation[]> => {
  const res = await Axios.get(`${BASE}`);
  return res.data as Conversation[];
};

const getMessages = async (conversationId: string): Promise<MessagesGetResponse> => {
  const res = await Axios.get(`${BASE}/${conversationId}/messages`);
  return res.data as MessagesGetResponse;
};

type SendPayload = {
  conversationId?: string;
  destinataireId: string;
  contenu?: string | null;
  typeContenu?: PrismaMessage["typeContenu"];
  fichierUrl?: string | null;
};

const sendMessage = async (payload: SendPayload): Promise<PrismaMessage> => {
  // backend : POST /messages OR POST /conversations/:id/messages
  if (payload.conversationId) {
    const res = await Axios.post(`messages`, payload);
    return res.data as PrismaMessage;
  }
  const res = await Axios.post(`${BASE}/messages`, payload);
  return res.data as PrismaMessage;
};

const markAsRead = async (conversationId: string) => {
  await Axios.patch(`${BASE}/${conversationId}/read`);
};

export default {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
};
