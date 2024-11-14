import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./reducers/auth";
import gameRoomSlice from "./reducers/gameRoom";

const store = configureStore({
  reducer: {
    [authSlice.name]: authSlice.reducer,
    [gameRoomSlice.name]: gameRoomSlice.reducer,
  },
});

export default store;
