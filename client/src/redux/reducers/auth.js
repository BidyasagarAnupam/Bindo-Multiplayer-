import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    loader: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        userExists: (state, action) => {
            state.user = action.payload;
            state.loader = false;
        },
        userNotExists: (state) => {
            state.user = null;
            state.loader = false;
        },
        isLoadingAuth: (state, action) => {
            state.loader = action.payload
        }
    }
})

export default authSlice;
export const { userExists, userNotExists, isLoadingAuth } = authSlice.actions;