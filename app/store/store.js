import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import tokensReducer from './tokensSlice';

// Persist configuration
const persistConfig = {
    key: 'root', // Key for localStorage
    storage,
    whitelist: ['tokens'], // Only persist the 'tokens' slice
  };
  
  const persistedReducer = persistReducer(persistConfig, tokensReducer);
  
  export const store = configureStore({
    reducer: {
      tokens: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for redux-persist
      }),
  });
  
  export const persistor = persistStore(store);