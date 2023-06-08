import { configureStore } from '@reduxjs/toolkit'
import algorithmsReducer from './slices/algorithmsSlice'

export const store = configureStore({
  reducer: {
    Algorithms: algorithmsReducer
  },
  devTools: true,
})