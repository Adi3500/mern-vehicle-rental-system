import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../api/endpoints';
import { clearAccessToken, getAccessToken, setAccessToken } from '../../api/storage';

const initialState = {
  user: null,
  accessToken: getAccessToken(),
  isAuthenticated: Boolean(getAccessToken()),
  status: 'idle',
  initialized: false,
  error: null,
  registerMessage: '',
};

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Unable to create your account.',
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      const data = response.data?.data || {};

      setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Unable to log you in.');
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.me();
      return response.data?.data?.user;
    } catch (error) {
      clearAccessToken();
      return rejectWithValue(
        error?.response?.data?.message || 'Unable to restore your session.',
      );
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(payload);
      return response.data?.data?.user;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Unable to update your profile.',
      );
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(payload);
      clearAccessToken();
      return response.data?.message || 'Password updated.';
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Unable to update your password.',
      );
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await authApi.logout();
  } catch (error) {
    // Ignore logout API failure because the local session still needs to be cleared.
  }

  clearAccessToken();
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.accessToken = action.payload?.accessToken || state.accessToken;
      state.user = action.payload?.user || state.user;
      state.isAuthenticated = Boolean(state.accessToken && state.user);
      state.initialized = true;
      state.error = null;
    },
    clearSession: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      state.initialized = true;
      state.registerMessage = '';
      clearAccessToken();
    },
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.registerMessage = '';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.registerMessage =
          action.payload?.message || 'Account created successfully.';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload?.accessToken || null;
        state.user = action.payload?.user || null;
        state.isAuthenticated = Boolean(
          action.payload?.accessToken && action.payload?.user,
        );
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = Boolean(state.accessToken && action.payload);
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.initialized = true;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.status = 'succeeded';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
        state.initialized = true;
      });
  },
});

export const { clearSession, setInitialized, setSession } = authSlice.actions;
export default authSlice.reducer;
