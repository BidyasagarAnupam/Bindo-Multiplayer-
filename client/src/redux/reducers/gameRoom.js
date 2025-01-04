import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    player1: null,
    player2: null,
    myBoard: null,
    currentTurn: null

};

const gameRoomSlice = createSlice({
    name: 'gameRoom',
    initialState: initialState,
    reducers: {
        setPlayer1: (state, action) => {
            state.player1 = action.payload;
        },
        setPlayer2: (state, action) => {
            state.player2 = action.payload;
        },
        setMyBoard: (state, action) => {
            state.myBoard = action.payload
        },
        setCurrentTurn: (state, action) => {
            state.currentTurn = action.payload;
        },
        resetGameRoom: (state) => {
            state.player1 = null;
            state.player2 = null;
            state.myBoard = null;
            state.currentTurn = null;

        },
    }
})

export default gameRoomSlice;
export const { setPlayer1, setPlayer2, setMyBoard, setCurrentTurn, resetGameRoom } = gameRoomSlice.actions;