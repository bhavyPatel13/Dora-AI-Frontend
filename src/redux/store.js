// import { configureStore } from "@reduxjs/toolkit";
// import userSlice from "./userSlice"

//  const store = configureStore({
//     reducer : {
//         user : userSlice
//     }
// })
// export default store;

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import userSlice from "./userSlice"

const rootReducer = combineReducers({
  user : userSlice,
  // other reducers...
});

    // console.log("Storage ===============> ", storage);

const persistConfig = {
  key: 'Dora-AI',
  storage : storage.default,
  // whitelist: ['user'] // optional: only persist specific reducers
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
