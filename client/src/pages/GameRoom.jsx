import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getSocket } from '../socket';
import cutIcon from '../assets/cut.svg';
import { CLICKED_ON_CELL_FROM_CLIENT, CLICKED_ON_CELL_FROM_SERVER, PLAYER_DONT_WANT_TO_PLAY_AGAIN, WINNER_NOTIFICATION_FROM_CLIENT, WINNER_NOTIFICATION_FROM_SERVER } from '../constants/events';
import { setCurrentTurn } from '../redux/reducers/gameRoom';
import { checkWinningCondition } from '../helper/functions';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Avatar, Button } from "@nextui-org/react";
import WINNERGIF from '../assets/winner.gif';
import LOSERGIF from '../assets/loser.gif';
import { HiOutlineHome, HiOutlineRefresh } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';


const GameRoom = () => {
  useDocumentTitle("Playing Mode | Bingo");
  const socket = getSocket();

  // To restrict the user from leaving the page
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; // Necessary for Chrome to show the dialog.
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);


  const { player1, player2, myBoard, currentTurn } = useSelector((state) => state.gameRoom);
  const [isCursorActive, setIsCursorActive] = useState(false);
  const [clickedCells, setClickedCells] = useState([]);
  const winningLetters = ["B", "I", "N", "G", "O"];
  const [winningLettersArray, setWinningLettersArray] = useState([]);
  const [completedWinningPositions, setCompletedWinningPositions] = useState([]);
  const [gameStatus, setGameStatus] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate()
  // setting for search modal
  const [openWinningModal, setopenWinningModal] = useState(true);

  const handleOpenChangeForWinningModal = (open) => {
    setopenWinningModal(open);
    console.log("open", open);
    if (!open) {
      // This is effectively your onClose function
      console.log("Modal is closing");
      // Perform any other close actions here
    }
  };
  // To close the search modal from outside:
  const closeModal = () => {
    setopenWinningModal(false);
  };

  // Update the cursor based on the current turn
  useEffect(() => {
    if (currentTurn === player1?.userDetail.userName) {
      setIsCursorActive(true);
    } else {
      setIsCursorActive(false);
    }
  }, [currentTurn]);

  const clickHandler = (cell, rowIndex, colIndex) => {
    setClickedCells([...clickedCells, `${rowIndex}-${colIndex}`]); // Update clicked cells
    // Emit the clicked cell to the server
    socket.emit(CLICKED_ON_CELL_FROM_CLIENT, { cell, currentTurn, player1, player2 });
  };

  // Listen for the clicked cell from the server
  useEffect(() => {
    const handleCellClickFromServer = ({ cell, nextTurn }) => {
      let rowIndex = -1;
      let colIndex = -1;
      for (let i = 0; i < myBoard.board.length; i++) {
        for (let j = 0; j < myBoard.board[i].length; j++) {
          if (myBoard.board[i][j] === cell) {
            rowIndex = i;
            colIndex = j;
            break;
          }
        }
        if (rowIndex !== -1 && colIndex !== -1) break;
      }

      if (rowIndex !== -1 && colIndex !== -1) {
        setClickedCells((prevClickedCells) => [...prevClickedCells, `${rowIndex}-${colIndex}`]);
      }
      dispatch(setCurrentTurn(nextTurn));
    };

    // Add the event listener and clean up on component unmount or when dependencies change
    socket.on(CLICKED_ON_CELL_FROM_SERVER, handleCellClickFromServer);

    return () => {
      socket.off(CLICKED_ON_CELL_FROM_SERVER, handleCellClickFromServer);
    };
  }, [socket, myBoard.board, dispatch]);

  useEffect(() => {
    console.log("clickedCells ", clickedCells);
    checkWinningCondition(winningLetters, clickedCells, winningLettersArray, setWinningLettersArray, completedWinningPositions, setCompletedWinningPositions);
  }, [clickedCells]);

  useEffect(() => {
    if (winningLettersArray.length === 5) {
      // emit event to the server
      socket.emit(WINNER_NOTIFICATION_FROM_CLIENT, { winner: player1, looser: player2 })
    }
  }, [winningLettersArray])

  socket.on(WINNER_NOTIFICATION_FROM_SERVER, ({ status }) => {
    if (status === "WON") {
      setGameStatus("WON");
    } else {
      setGameStatus("LOST");
    }
    setopenWinningModal(true);
  });

  // handle when user press Home button after winning/losing the match
  const handleHomeButton = () => {
    // emit an event that the player1 don't want to play again
    socket.emit(PLAYER_DONT_WANT_TO_PLAY_AGAIN, { player1, player2 });
    navigate('/')
  }

  

  return (
    <>
      <div className='flex items-center justify-center bg-gradient-to-b from-gray-900 to-black'>
        <div className='p-4 min-h-[95vh] w-full lg:w-1/2 flex flex-col-reverse items-center justify-center gap-5'>
          {/* Board */}
          <div className={`${isCursorActive ? "bg-white" : "bg-slate-500 cursor-not-allowed"} shadow-md rounded-lg p-4 md:p-6`}>
            <h1 className="text-xl md:text-2xl font-bold text-center mb-4 text-gray-700">Board</h1>
            <div className="grid grid-cols-5 gap-2">
              {myBoard.board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div key={`${rowIndex}-${colIndex}`} className="relative">
                    <input
                      id={`${rowIndex}-${colIndex}`}
                      type="number"
                      min="1"
                      max="25"
                      value={cell || ''} // Display generated value or user input
                      className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-center 
                      border bg-slate-900 border-gray-300 rounded-md 
                      focus:outline-none focus:ring-2 focus:ring-blue-400 
                      text-white text-lg md:text-xl appearance-none
                      ${isCursorActive ? 'cursor-pointer' : 'cursor-not-allowed'}
                    `}
                      readOnly={!isCursorActive}
                      onClick={() => isCursorActive ? clickHandler(cell, rowIndex, colIndex) : null}
                    />
                    {clickedCells.includes(`${rowIndex}-${colIndex}`) && (
                      <img
                        src={cutIcon}
                        alt="Cut Icon"
                        className="absolute inset-0 w-full h-full"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details of the game */}
          <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg text-yellow-200 text-center">
            <h3 className="text-2xl font-bold mb-4">Game Room Details</h3>
            <div className="text-lg space-y-2">
              <p><strong className="text-yellow-400">You:</strong> <span className='capitalize'>{player1?.userDetail.userName}</span></p>
              <p><strong className="text-yellow-400">Opponent:</strong> <span className='capitalize'>{player2?.userDetail.userName}</span></p>
              <p><strong className="text-yellow-400">Current Turn:</strong> <span className="text-pink-400">{currentTurn}</span></p>
              <div>
                {winningLettersArray.map((letter, index) => (
                  <span key={index}>{letter} </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={openWinningModal}
        onOpenChange={handleOpenChangeForWinningModal}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        placement="center"
        size='sm'
        backdrop='blur'
        closeButton={<></>}
        className='dark text-foreground'
        classNames={{
          wrapper: "[--slide-exit:0px]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{gameStatus === "WON" ? "You WON the match 🥳" : "You LOST the match 😢"}</ModalHeader>
              <ModalBody>
                <div className='flex flex-col items-center justify-center gap-5'>
                  <Avatar
                    isBordered
                    color="default"
                    src={gameStatus === "WON" ? WINNERGIF : LOSERGIF}
                    className="w-48 h-48 text-large"
                    radius='md'
                  />
                  <div className='text-center'>
                    {gameStatus === "WON" ? "Congratulations! You won the match." : "You lost the match. Better luck next time."}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  onPress={() => {
                    handleHomeButton();
                  }}
                  color='danger' 
                  className='font-semibold' 
                  endContent={<HiOutlineHome size='20px' 
                  />}>Home</Button>
                <Button color='success' className='font-semibold text-white' endContent={<HiOutlineRefresh size='20px'/>}>Play Again</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default GameRoom;
