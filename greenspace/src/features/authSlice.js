import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserDetails, logoutUser } from '../services/hooks';

const loadAuthState = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  return { token, user };
};

export const fetchUserDetailsThunk = createAsyncThunk(
  'auth/fetchUserDetails',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      return await fetchUserDetails(token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const { token } = getState().auth;
      if (token) await logoutUser(token);
      
      // Clear notifications on logout
      dispatch(clearNotifications());
      
      return true;
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
    isLoggingOut: false,
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
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    loadUser: (state) => {
      const { token, user } = loadAuthState();
      state.token = token;
      state.user = user;
      state.isLoading = false;
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
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchUserDetailsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutThunk.pending, (state) => {
        state.isLoggingOut = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isLoggingOut = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.isLoggingOut = false;
        state.error = action.payload;
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, loadUser } = authSlice.actions;
export default authSlice.reducer;