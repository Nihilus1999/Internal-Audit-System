import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProfile } from "@/services/Profile";

const initialState = {
  data: null,
  initials: null,
  token: localStorage.getItem("token") || null,
  status: "idle",
  error: null,
};

// Thunk para obtener el perfil del usuario
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, thunkAPI) => {
    try {
      const data = await getProfile();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.message,
        status: error.response?.status || null,
      });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.data = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.data = null;
      state.token = null;
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.data = null;
      });
  },
});

export const selectUser = (state) => state.auth.data;
export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
