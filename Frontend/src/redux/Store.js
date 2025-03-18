import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Defaults to localStorage for web
import { combineReducers } from 'redux';
import authReducer from './features/authSlice';
import userReducer from './features/userSlice';

// Create a persist configuration
const persistConfig = {
  key: 'root', // The key used for localStorage
  storage,     // Define storage engine
  version: 1,  // Optional: versioning for migrations
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with persisted reducer & middleware fix
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Ignore persist warnings
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
