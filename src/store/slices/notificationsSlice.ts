
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SupabaseService } from '../../services/supabaseService';

interface Notification {
  id: string;
  type: 'application' | 'job' | 'interview' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  realTimeEnabled: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  realTimeEnabled: false,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId: string) => {
    const notifications = await SupabaseService.getNotifications(userId);
    return notifications;
  }
);

export const markNotificationAsReadAsync = createAsyncThunk(
  'notifications/markAsRead',
  async ({ userId, notificationId }: { userId: string; notificationId: string }) => {
    await SupabaseService.markNotificationAsRead(userId, notificationId);
    return notificationId;
  }
);

export const subscribeToNotifications = createAsyncThunk(
  'notifications/subscribe',
  async (userId: string, { dispatch }) => {
    const subscription = SupabaseService.subscribeToNotifications(userId, (notification) => {
      dispatch(addNotification(notification));
    });
    return subscription;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },
    setRealTimeEnabled: (state, action: PayloadAction<boolean>) => {
      state.realTimeEnabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des notifications';
      })
      .addCase(markNotificationAsReadAsync.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount -= 1;
        }
      });
  },
});

export const {
  addNotification,
  markNotificationAsRead,
  markAllAsRead,
  removeNotification,
  setRealTimeEnabled,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
