import React, { useEffect, useState } from 'react'
import './App.css'
import { toast } from "react-hot-toast";

const App = () => {
  const [board, setBoard] = useState(Array(5).fill(Array(5).fill(null)));

  const handleInputChange = (row, col, value) => {
    const numValue = parseInt(value);
    console.log(value);

    if (numValue >= 1 && numValue <= 25) {
      // Update cell with valid value
      const updatedBoard = board.map((r, i) =>
        r.map((cell, j) => (i === row && j === col ? numValue : cell))
      );
      setBoard(updatedBoard);
    } else {
      // If invalid, clear the current cell's value and show an alert
      console.log("aaya");
      toast.error("Please enter a number between 1 and 25", {
        position: "top-right",
        duration: 2000,
      });
      const updatedBoard = board.map((r, i) =>
        r.map((cell, j) => (i === row && j === col ? null : cell))
      );
      setBoard(updatedBoard);
      const cell = document.querySelector(`input[id="${row}-${col}"]`);
      cell.value = '';
      cell.classList.add('shake');
      setTimeout(() => {
        cell.classList.remove('shake');
      }, 500); // Remove the shake class after 500ms
    }
  };

  useEffect(() => {
    console.log("board", board);
  },[board])


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-4">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-700">Create your Bingo Board</h1>
        <div className="grid grid-cols-5 gap-2">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              
              <input
                key={`${rowIndex}-${colIndex}`}
                id={`${rowIndex}-${colIndex}`}
                type="number"
                min="1"
                max="25"
                className="w-16 h-16 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 text-lg appearance-none"
                onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App