import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  errors: [],
  notifications: [],
  isLoading: false,
  globalError: null,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setError: (state, action) => {
      // Add new error with unique ID and timestamp
      state.errors.push({
        id: Date.now(),
        message: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearError: (state, action) => {
      // Remove specific error by ID
      state.errors = state.errors.filter(error => error.id !== action.payload);
    },
    clearAllErrors: (state) => {
      state.errors = [];
      state.globalError = null;
    },
    setGlobalError: (state, action) => {
      state.globalError = {
        message: action.payload,
        timestamp: new Date().toISOString(),
      };
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setError,
  clearError,
  clearAllErrors,
  setGlobalError,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setLoading,
} = errorSlice.actions;

// Selectors
export const selectErrors = (state) => state.error.errors;
export const selectGlobalError = (state) => state.error.globalError;
export const selectNotifications = (state) => state.error.notifications;
export const selectIsLoading = (state) => state.error.isLoading;

// Custom action creator for timed notifications
export const addTimedNotification = (notification, duration = 5000) => (dispatch) => {
  const id = Date.now();
  dispatch(addNotification({ ...notification, id }));
  
  setTimeout(() => {
    dispatch(removeNotification(id));
  }, duration);
};

// Error handler middleware
export const errorHandler = (error) => (dispatch) => {
  console.error('Error caught by handler:', error);

  if (error.response) {
    // Handle API errors
    const errorMessage = error.response.data.message || 'An error occurred with the server';
    dispatch(setError(errorMessage));
  } else if (error.request) {
    // Handle network errors
    dispatch(setError('Network error. Please check your connection.'));
  } else {
    // Handle other errors
    dispatch(setError(error.message || 'An unexpected error occurred'));
  }

  // Automatically clear error after 5 seconds
  setTimeout(() => {
    dispatch(clearError(error.id));
  }, 5000);
};

export default errorSlice.reducer;