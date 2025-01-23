import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getSocket } from '../socket';
import cutIcon from '../assets/cut.svg';
import { CLICKED_ON_CELL_FROM_CLIENT, CLICKED_ON_CELL_FROM_SERVER, OPPONENT_LEFT_MATCH_FROM_SERVER, PLAYER_ACCEPT_FOR_REMATCH_FROM_CLIENT, PLAYER_ACCEPT_FOR_REMATCH_FROM_SERVER, PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_CLIENT, PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_SERVER, PLAYER_LEFT_MATCH_FROM_CLIENT, PLAYER_WANT_TO_PLAY_AGAIN_FROM_CLIENT, PLAYER_WANT_TO_PLAY_AGAIN_FROM_SERVER, WINNER_NOTIFICATION_FROM_CLIENT, WINNER_NOTIFICATION_FROM_SERVER } from '../constants/events';
import { resetGameRoom, setCurrentTurn } from '../redux/reducers/gameRoom';
import { checkWinningCondition } from '../helper/functions';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Avatar, Button, Tooltip } from "@heroui/react";
import WINNERGIF from '../assets/winner.gif';
import LOSERGIF from '../assets/loser.gif';
import YOURTURNGIF from '../assets/yourTurn.gif';
import OPPONENTTURNGIF from '../assets/opponentTurn.gif';
import { HiCheckCircle, HiOutlineHome, HiOutlineRefresh } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IoSettings, IoExitOutline } from "react-icons/io5";
import { FaInfoCircle } from "react-icons/fa";

const GameRoom = () => {
  useDocumentTitle("Playing Mode | Bingo");
  const socket = getSocket();


  const { player1, player2, myBoard, currentTurn } = useSelector((state) => state.gameRoom);
  const [isCursorActive, setIsCursorActive] = useState(false);
  const [clickedCells, setClickedCells] = useState([]);
  const winningLetters = ["B", "I", "N", "G", "O"];
  const [winningLettersArray, setWinningLettersArray] = useState([]);
  const [completedWinningPositions, setCompletedWinningPositions] = useState([]);
  const [gameStatus, setGameStatus] = useState("");
  const [isPlayerDontWantToPLayAgain, setIsPlayerDontWantToPLayAgain] = useState(false);
  const [openWinningModal, setopenWinningModal] = useState(false);
  const [requestingForPlayAgain, setRequestingForPlayAgain] = useState(false);
  const [opponentRequestingPlayAgain, setOpponentRequestingPlayAgain] = useState(false);
  const [requestAccepted, setRequestAccepted] = useState(false);
  const [isOpponentLeft, setIsOpponentLeft] = useState(false);
  const [openSettingsModal, setopenSettingsModal] = useState(false);
  const [playerWantToLeft, setPlayerWantToLeft] = useState(false);

  // To restrict the user from leaving the page
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Do you want to exit the game'; // Necessary for Chrome to show the dialog.
    };

    if (!playerWantToLeft)
      window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate()
  // setting for winning modal
  const handleOpenChangeForWinningModal = (open) => {
    setopenWinningModal(open);
    console.log("open", open);
    if (!open) {
      // This is effectively your onClose function
      console.log("Modal is closing");
      // Perform any other close actions here
    }
  };
  // To close the Winning modal from outside:
  const closeWinningModal = () => {
    setopenWinningModal(false);
  };

  // setting for winning modal
  const handleOpenChangeForSettingsModal = (open) => {
    setopenSettingsModal(open);
    console.log("open", open);
    if (!open) {
      // This is effectively your onClose function
      console.log("Modal is closing");
      // Perform any other close actions here
    }
  };
  // To close the Winning modal from outside:
  const closeSettingsModal = () => {
    setopenSettingsModal(false);
  };

  // Update the cursor based on the current turn
  useEffect(() => {
    if (currentTurn === player1?.userDetail.userName) {
      setIsCursorActive(true);
    } else {
      setIsCursorActive(false);
    }
  }, [currentTurn]);

  // Handle the click event on the cell
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

  // Check the winning condition
  useEffect(() => {
    checkWinningCondition(winningLetters, clickedCells, winningLettersArray, setWinningLettersArray, completedWinningPositions, setCompletedWinningPositions);
  }, [clickedCells]);

  // Emit the winning notification to the server
  useEffect(() => {
    if (winningLettersArray.length === 5) {
      // emit event to the server
      socket.emit(WINNER_NOTIFICATION_FROM_CLIENT, { winner: player1, looser: player2 })
    }
  }, [winningLettersArray])

  // Listen for the winning notification from the server
  useEffect(() => {
    const handleWinnerNotification = ({ status }) => {
      if (status === "WON") {
        setGameStatus("WON");
      } else {
        setGameStatus("LOST");
      }
      setTimeout(() => {
        setopenWinningModal(true);
      }, 1000);

    };

    socket.on(WINNER_NOTIFICATION_FROM_SERVER, handleWinnerNotification);

    return () => {
      socket.off(WINNER_NOTIFICATION_FROM_SERVER, handleWinnerNotification);
    };
  }, [socket]);

  // handle when user press Home button after winning/losing the match
  const handleHomeButton = () => {
    // emit an event that the player1 don't want to play again
    socket.emit(PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_CLIENT, { player1, player2 });
    navigate('/')
    dispatch(resetGameRoom())
  }

  // Listen for the player don't want to play again
  useEffect(() => {
    const handlePlayerDontWantToPlayAgain = ({ message }) => {
      setIsPlayerDontWantToPLayAgain(true);
    };

    socket.on(PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_SERVER, handlePlayerDontWantToPlayAgain);

    return () => {
      socket.off(PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_SERVER, handlePlayerDontWantToPlayAgain);
    };
  }, [socket]);

  // Handle when player want to play again
  const playAgainHandler = () => {
    // emit an event that the player1 want to play again
    socket.emit(PLAYER_WANT_TO_PLAY_AGAIN_FROM_CLIENT, {
      player1,
      player2
    });
    setRequestingForPlayAgain(true);
    console.log("Tum request bhej chuke ho....");
  }

  // Listen for the player want to play again
  useEffect(() => {
    const handlePlayerWantToPlayAgain = ({ message }) => {
      setOpponentRequestingPlayAgain(true);
      console.log("message ", message);
    };

    socket.on(PLAYER_WANT_TO_PLAY_AGAIN_FROM_SERVER, handlePlayerWantToPlayAgain);

    return () => {
      socket.off(PLAYER_WANT_TO_PLAY_AGAIN_FROM_SERVER, handlePlayerWantToPlayAgain);
    };
  }, [socket]);

  // Handle when player accept the play again request
  const handleRequestAccepted = () => {
    socket.emit(PLAYER_ACCEPT_FOR_REMATCH_FROM_CLIENT, {
      player1,
      player2
    });
  }

  // Listen for the player accept for rematch
  useEffect(() => {
    const handlePlayerAcceptForRematch = ({ currentTurn }) => {
      setRequestAccepted(true);
      console.log("Your socket Id ", socket.id);

      setTimeout(() => {
        resetGame(currentTurn);
        closeWinningModal();
      }, 2000);

    };

    socket.on(PLAYER_ACCEPT_FOR_REMATCH_FROM_SERVER, handlePlayerAcceptForRematch);

    return () => {
      socket.off(PLAYER_ACCEPT_FOR_REMATCH_FROM_SERVER, handlePlayerAcceptForRematch);
    };

  }, [socket])

  // Reset the game
  const resetGame = (currentTurn) => {
    setGameStatus("");
    setClickedCells([]);
    setWinningLettersArray([]);
    setCompletedWinningPositions([]);
    dispatch(setCurrentTurn(currentTurn));
    setIsPlayerDontWantToPLayAgain(false)
    setopenWinningModal(false)
    setRequestingForPlayAgain(false)
    setOpponentRequestingPlayAgain(false)
    setRequestAccepted(false)
    setIsOpponentLeft(false)

  }

  // Listen for the opponent left the match
  useEffect(() => {
    const handleOpponentLeftTheGame = ({ winner }) => {
      console.log("Winner is ", winner);
      setGameStatus("WON");
      setIsOpponentLeft(true);
      toast.error(`Opponent left the game and winner is ${winner}`)
      setTimeout(() => {
        setopenWinningModal(true);
      }, 1000);
    }

    socket.on(OPPONENT_LEFT_MATCH_FROM_SERVER, handleOpponentLeftTheGame);

    return () => {
      socket.off(OPPONENT_LEFT_MATCH_FROM_SERVER, handleOpponentLeftTheGame);
    }

  }, [socket])

  // Handle when user want to leave the match
  const handleLeaveMatch = () => {
    setPlayerWantToLeft(true);
    toast.error("You left the match")
    socket.emit(PLAYER_LEFT_MATCH_FROM_CLIENT, { socketId: socket.id });
    dispatch(resetGameRoom())
    navigate('/')
  }

  const goToHomePage = () => {
    dispatch(resetGameRoom())
    navigate('/')
  }


  return (
    <>
      <div className='flex items-center justify-center bg-gradient-to-b from-gray-900 to-black'>
        <div className='p-4 min-h-[100vh] md:min-h-[95vh] w-full lg:w-1/2 flex flex-col-reverse items-center justify-end md:justify-center gap-5 '>
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

          <div className='w-fit flex gap-2'>
            {winningLettersArray.map((letter, index) => (
              <span
                className='font-semibold text-2xl bg-yellow-500 px-2  rounded-md'
                key={index}
              >{letter} </span>
            ))}
          </div>

          {/* Details of the game */}
          <div className='flex flex-col gap-16 md:gap-20 items-center justify-center w-full'>
            <div className="bg-black flex gap-3 bg-opacity-70 p-4 rounded-lg shadow-lg text-yellow-200 text-center">
              <h3 className="text-2xl font-bold">Game Room Details</h3>
              <Tooltip
                showArrow
                placement='top'
                content="Settings"
                shouldFlip
                color='default'
              >
                <div className='text-white cursor-pointer'
                  onClick={() => setopenSettingsModal(true)}
                >
                  <IoSettings size="30px" />
                </div>
              </Tooltip>
            </div>

            <div className='flex w-full md:w-2/3 items-center justify-center relative'>
              <Avatar
                src={currentTurn === player1?.userDetail.userName ? YOURTURNGIF : OPPONENTTURNGIF}
                className={`w-24 h-24 md:w-32 md:h-32 text-large z-10 absolute 
              bg-transparent -top-20 md:-top-[6.5rem]
              transform transition-transform duration-700 ease-in-out
              ${currentTurn === player1?.userDetail.userName ? '-translate-x-full' : 'translate-x-full'}`}
                radius="md"
              />


              {/* Player 1  */}
              <div className='w-1/2 bg-blue-500 p-3 flex items-center gap-2 rounded-tl-lg rounded-bl-lg'>
                <Tooltip
                  showArrow
                  placement='left'
                  content={player1?.userDetail.userName}
                  shouldFlip
                  color='danger'
                >
                  <Avatar
                    size='md'
                    className='cursor-pointer'
                    isBordered
                    color="danger"
                    src={`${player1?.userDetail?.profileDetails?.avatar}`} />
                </Tooltip>

                <span className='capitalize font-semibold'>You</span>
              </div>
              {/* Player 2 */}
              <div className='w-1/2 bg-red-500 p-3 flex flex-row-reverse items-center gap-2 rounded-tr-lg rounded-br-lg'>
                <Tooltip
                  showArrow
                  placement='right'
                  content={player2?.userDetail.userName}
                  shouldFlip
                  color='primary'
                >
                  <Avatar
                    size=''
                    className='cursor-pointer'
                    isBordered
                    color="primary"
                    src={`${player2?.userDetail?.profileDetails?.avatar}`} />
                </Tooltip>
                <span className='capitalize font-semibold'>Opponent</span>
              </div>
            </div>

          </div>

        </div>
      </div>
      {/* Winning modal */}
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
              <ModalHeader className="flex flex-col gap-1">{requestAccepted ? "Ready For rematch...💪🏻" : isOpponentLeft ? "Opponent left the match 🙄" : gameStatus === "LOST" ? "You LOST the match 😢" : "You WON the match 🥳"}</ModalHeader>
              <ModalBody>
                {
                  requestAccepted &&
                  <div className="tracking-in-contract-bck">
                    REMATCH!
                  </div>

                }
                {!requestAccepted &&
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
                  </div>}
              </ModalBody>
              <ModalFooter>
                <div className='flex flex-col gap-2 items-end'>
                  {
                    (!requestAccepted && isPlayerDontWantToPLayAgain) && (
                      <p className='text-sm font-medium text-yellow-500'>Opponent don't want to Play Again...</p>
                    )
                  }
                  {
                    (!requestAccepted && requestingForPlayAgain && !isPlayerDontWantToPLayAgain) && (
                      <p className='text-sm font-medium text-yellow-500'>Waiting for opponent...</p>
                    )
                  }
                  {
                    (!requestAccepted && opponentRequestingPlayAgain) && (
                      <p className='text-sm font-medium text-yellow-500'>Opponent wants to play again...</p>
                    )
                  }
                  {/* All buttons */}
                  <div className='flex gap-2'>
                    {
                      (!requestAccepted && (!requestingForPlayAgain || isPlayerDontWantToPLayAgain)) &&
                      (<Button
                        onPress={() => {
                          !isPlayerDontWantToPLayAgain ? handleHomeButton() : goToHomePage()
                        }}
                        color='danger'
                        className='font-semibold'
                        endContent={<HiOutlineHome size='20px'
                        />}>
                        Home...
                      </Button>)
                    }

                    {
                      (!isOpponentLeft && !requestAccepted && !requestingForPlayAgain && !isPlayerDontWantToPLayAgain && !opponentRequestingPlayAgain) && (
                        <Button
                          color='success'
                          className='font-semibold text-white'
                          onPress={() => {
                            playAgainHandler();
                          }}
                          endContent={
                            <HiOutlineRefresh size='20px' />
                          }>
                          Play Again
                        </Button>
                      )
                    }
                    {
                      (!requestAccepted && opponentRequestingPlayAgain) && (
                        <Button
                          color='success'
                          className='font-semibold text-white'
                          onPress={() => {
                            handleRequestAccepted();
                          }}
                          endContent={
                            <HiCheckCircle size='20px' />
                          }>
                          Accept the request
                        </Button>
                      )
                    }
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={openSettingsModal}
        onOpenChange={handleOpenChangeForSettingsModal}
        placement='auto'
        backdrop='blur'
        size='sm'
        className='dark text-foreground'
        classNames={{
          wrapper: "[--slide-exit:0px]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Settings</ModalHeader>
              <ModalBody>
                {/* Sound toggle */}
                {/* Volume bar */}
                {/* Leave the Match */}
                <div className='flex justify-between items-center'>
                  <div className='flex gap-1'>
                    <p className='text-sm'>Want to leave the game ?</p>
                    <Tooltip
                      content="If you leave the match, you will lose the game."
                      placement="top"
                      color='danger'
                      
                    >
                      <div className='cursor-pointer'>
                        <FaInfoCircle />
                      </div>
                    </Tooltip>
                  </div>
                  <IoExitOutline size="25px" className='text-red-600 cursor-pointer'
                    onClick={() => {
                      handleLeaveMatch()
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="bordered" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default GameRoom;
