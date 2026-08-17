/**
 * Redux State Slice: Authentication & Subscription Management
 * Handles user profile state, session validation thunks, and live subscription status synchronization.
 */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getMe, type UserProfileResponse } from '../services/authService';
import { getSubscription } from '../services/paymentService';

/**
 * Interface representing the authenticated user profile.
 */
export interface User {
  uid: string;
  id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  username?: string;
  bio?: string;
  avatar?: string;
  plan?: 'FREE' | 'PRO';
}

/**
 * Interface representing the authentication state shape in Redux store.
 */
export interface AuthState {
  /** Currently logged-in user profile or null if unauthenticated */
  user: User | null;
  /** Session validation loading status on application boot */
  loading: boolean;
  /** Computed authentication status indicator */
  isAuthenticated: boolean;
}

/**
 * Helper function to retrieve pre-saved user session from localStorage.
 */
const getInitialUser = (): User | null => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

/** Initial state definition reading cached user data if available */
const initialState: AuthState = {
  user: getInitialUser(),
  loading: true,
  isAuthenticated: !!getInitialUser(),
};

/**
 * Async Thunk: Validates stored JWT session token against GET /api/auth/me backend endpoint.
 * Purges invalid credentials if token is expired or unauthorized.
 */
export const validateSession = createAsyncThunk(
  'auth/validateSession',
  async (_, { dispatch }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.removeItem('user');
      dispatch(setUser(null));
      return null;
    }

    try {
      const currentUser: UserProfileResponse = await getMe();
      localStorage.setItem('user', JSON.stringify(currentUser));
      dispatch(setUser(currentUser));
      return currentUser;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch(setUser(null));
      return null;
    }
  }
);

/**
 * Async Thunk: Fetches live subscription status from backend (/api/payment/subscription)
 * and updates user plan in Redux state & localStorage.
 */
export const refreshSubscriptionThunk = createAsyncThunk(
  'auth/refreshSubscription',
  async (_, { getState, dispatch }) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const subscription = await getSubscription();
      const state = getState() as { auth: AuthState };
      if (state.auth.user) {
        const updatedUser: User = {
          ...state.auth.user,
          plan: (subscription.plan as 'FREE' | 'PRO') || 'FREE',
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch(setUser(updatedUser));
      }

      // Broadcast event across UI components if needed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscription-updated', { detail: subscription }));
      }
    } catch {
      // Retain current state gracefully on network error
    }
  }
);

/**
 * Redux slice defining auth reducers and extraReducers for async thunk lifecycle.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Sets active user state and updates isAuthenticated flag */
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    /** Updates session loading state */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    /** Logs out user, clearing state and purging localStorage tokens */
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.isAuthenticated = false;
    },
    /** Updates user profile details and syncs localStorage */
    updateUser: (state, action: PayloadAction<User>) => {
      const updated = {
        ...action.payload,
        plan: action.payload.plan || state.user?.plan || 'FREE',
      };
      localStorage.setItem('user', JSON.stringify(updated));
      state.user = updated;
      state.isAuthenticated = true;
    },
    /** Explicitly updates subscription plan tier (FREE or PRO) */
    setPlan: (state, action: PayloadAction<'FREE' | 'PRO'>) => {
      if (!state.user) return;
      const updated = { ...state.user, plan: action.payload };
      localStorage.setItem('user', JSON.stringify(updated));
      state.user = updated;
    },
    /** Toggles subscription plan between FREE and PRO (for testing/demo) */
    togglePlan: (state) => {
      if (!state.user) return;
      const newPlan: 'FREE' | 'PRO' = state.user.plan === 'PRO' ? 'FREE' : 'PRO';
      const updated: User = { ...state.user, plan: newPlan };
      localStorage.setItem('user', JSON.stringify(updated));
      state.user = updated;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateSession.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(validateSession.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setUser, setLoading, logout, updateUser, setPlan, togglePlan } = authSlice.actions;
export default authSlice.reducer;
