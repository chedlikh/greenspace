import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserDetails } from '../services/hooks';

// Helper function to load state from localStorage
const loadAuthState = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null; // Safely parse user
  return { token, user };
};

// Async thunk for fetching user details
export const fetchUserDetailsThunk = createAsyncThunk(
  'auth/fetchUserDetails',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const userDetails = await fetchUserDetails(token);
      return userDetails;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    isLoading: true,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      // Save token and user to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      console.log('Token and user saved to localStorage:', {
        token: action.payload.token,
        user: action.payload.user,
      });
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      // Clear token and user from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Token and user cleared from localStorage');

    },
    loadUser: (state) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Loaded token and user from localStorage:', { token, user });
        state.token = token;
        state.user = user;
        state.isLoading = false; // Assure-toi que l'état est mis à jour ici
      },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetailsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDetailsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserDetailsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export all actions
export const { loginStart, loginSuccess, loginFailure, logout, loadUser } = authSlice.actions;
export default authSlice.reducer;