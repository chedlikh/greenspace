import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';

export const fetchConversations = createAsyncThunk(
  'conversations/fetchConversations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      const response = await fetch(`${API_BASE_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const conversations = await response.json();
      return conversations.map(conv => ({
        ...conv,
        id: String(conv.id), // Normalize to string for frontend
      }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const conversationSlice = createSlice({
  name: 'conversations',
  initialState: {
    conversations: [], // Array of conversation objects
    error: null,
  },
  reducers: {
    setConversations(state, action) {
      state.conversations = action.payload;
      state.error = null;
    },
    addConversation(state, action) {
      const conversation = { ...action.payload, id: String(action.payload.id) };
      if (!state.conversations.some(conv => conv.id === conversation.id)) {
        state.conversations.push(conversation);
      }
    },
    updateConversation(state, action) {
      const updated = { ...action.payload, id: String(action.payload.id) };
      state.conversations = state.conversations.map(conv =>
        conv.id === updated.id ? updated : conv
      );
    },
    removeConversation(state, action) {
      const conversationId = String(action.payload);
      state.conversations = state.conversations.filter(conv => conv.id !== conversationId);
    },
    setConversationsError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setConversations,
  addConversation,
  updateConversation,
  removeConversation,
  setConversationsError,
} = conversationSlice.actions;

export default conversationSlice.reducer;