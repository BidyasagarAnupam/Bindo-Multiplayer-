import React, { useEffect, useState } from 'react'
import useDocumentTitle from "../hooks/useDocumentTitle";
import { toast } from "react-hot-toast";
import '../App.css'
import { Button, Divider } from "@heroui/react";
import Board from '../components/common/Board';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { serverURL } from '../constants/config';


const CreateBoard = () => {
  useDocumentTitle("Create your BINGO boards | Bingo");

  const [board, setBoard] = useState(Array(5).fill(Array(5).fill(null)));
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      toast.error("Number must be between 1 and 25", {
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


  const generateRandomBoard = () => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1); // Generate numbers 1-25
    const shuffledNumbers = numbers.sort(() => Math.random() - 0.5); // Shuffle array

    // Fill 5x5 grid with shuffled numbers
    const newBoard = Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) => shuffledNumbers[row * 5 + col])
    );

    setBoard(newBoard);
  };

  const clearBoardHandler = () => {
    setBoard(Array(5).fill(Array(5).fill(null)))
  }

  const saveBoardHandler = async () => {
    const toastId = toast.loading("Creating Board...");
    setIsLoading(true);
    // first check if the board is valid
    // check if all cells are filled
    const isBoardValid = board.every((row) => row.every((cell) => cell !== null));
    if (!isBoardValid) {
      toast.error("Please fill all cells before saving", {
        id: toastId,
      });
      setIsLoading(false);
      return;
    }
    // check all numbers are unique
    const numbers = board.flat();
    const uniqueNumbers = new Set(numbers);
    if (numbers.length !== uniqueNumbers.size) {
      toast.error("Numbers must be unique", {
        id: toastId,
      });
      setIsLoading(false);
      return;
    }

    // save the board
    try {
      const res = await axios.post(`${serverURL}/api/v1/board/create-board`, { board }, { withCredentials: true });
      toast.success(res.data.message, {
        id: toastId,
      });
      navigate("/all-boards")
    } catch (error) {
      console.log("Error", error);
      toast.error(error?.response?.data?.message || "Something went wrong", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="min-h-[93.52vh]  flex flex-col items-center justify-center gap-6">
      <Board heading='Create your BINGO board' board={board} handleInputChange={handleInputChange} readOnly={false} />
      <div className='flex flex-col gap-3 w-4/5 md:w-2/5 lg:w-2/6 xl:w-1/5 items-center justify-center'>
        <div className='flex gap-4 w-full'>
          <Button
            className='text-xl font-semibold w-full md:w-full '
            color='primary'
            variant='shadow'
            isLoading={isLoading}
            onClick={() => saveBoardHandler()}
          >
            Save
          </Button>
          <Button
            className='text-xl font-semibold w-full md:w-full '
            color='danger'
            variant='shadow'
            isDisabled={isLoading}
            onClick={clearBoardHandler}
          >
            Clear Board
          </Button>
        </div>
        <div className='flex  gap-2 items-center justify-center w-full'>
          <Divider className='bg-white w-1/3' />
          <span>OR</span>
          <Divider className='bg-white w-1/3' />
        </div>

        <Button
          className='text-xl font-semibold text-black w-full bg-yellow-300'
          variant='shadow'
          onClick={generateRandomBoard}
          isDisabled={isLoading}
        >
          Generate
        </Button>
      </div>

    </div>

  )
}

export default CreateBoard