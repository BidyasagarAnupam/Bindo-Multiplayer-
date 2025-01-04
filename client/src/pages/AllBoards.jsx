import React, { useEffect, useState } from 'react';
import Board from '../components/common/Board';
import { Button } from "@nextui-org/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { Divider } from '@nextui-org/react';
import axios from "axios";
import { serverURL } from '../constants/config';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../socket';
import SearchOpponent from '../components/SearchOpponent';
import { OPPONENT_FOUND, OPPONENT_LEFT_MATCH_FROM_SERVER, OPPONENT_NOT_FOUND, SEARCH_FOR_AN_OPPONENT } from '../constants/events';
import { useDispatch, useSelector } from 'react-redux';
import { resetGameRoom, setCurrentTurn, setMyBoard, setPlayer1, setPlayer2 } from '../redux/reducers/gameRoom';
import { ERROR_SAVING_GAME } from '../constants/events';
import PlayWithFriend from '../components/PlayWithFriend';

const AllBoards = () => {
    useDocumentTitle("All Boards | Bingo");

    const socket = getSocket();

    const { user } = useSelector((state) => state.auth)
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const navigate = useNavigate();
    const dispatch = useDispatch()


    const [board, setBoard] = useState([[]]);
    const [boards, setBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [opponent, setOpponent] = useState(null);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [openPlayWithFriendModal, setOpenPlayWithFriendModal] = useState(false);

    // setting for search modal
    const handleSearchModalOpenChange = (open) => {
        setOpenSearchModal(open);
        console.log("open", open);
        if (!open) {
            // This is effectively your onClose function
            // Perform any other close actions here
        }
    };
    // To close the search modal from outside:
    const closeSearchModal = () => {
        setOpenSearchModal(false);
    };
    
    // setting for play with friend modal
    const handlePlayWithFriendModalOpenChange = (open) => {
        setOpenPlayWithFriendModal(open);
        console.log("open", open);
        if (!open) {
            // This is effectively your onClose function
            // Perform any other close actions here
        }
    };
    // To close the  play with friend modal from outside:
    const closePlayWithFriendModal = () => {
        setOpenPlayWithFriendModal(false);
    };

    // Fetch all boards
    const fetchBoards = async () => {
        const toastId = toast.loading("Fetching all boards...");
        setIsLoading(true);
        try {
            const res = await axios.get(`${serverURL}/api/v1/board/get-all-boards`,
                {
                    withCredentials: true
                }
            )
            setBoards(res.data.boards);
            toast.success(res.data.message, {
                id: toastId,
            });
        } catch (error) {
            console.log("All Boards error", error);
            toast.error(error?.response?.data?.message || "Something Went Wrong", {
                id: toastId,
            });
        } finally {
            toast.dismiss(toastId);
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchBoards()
    }, [])

    const useBoardHandler = (board) => {
        setBoard(board)
        onOpen()
    }

    // to search for an opponent
    const searchOpponentHandler = () => {
        setOpenSearchModal(true)
        // Emit an event to the server to search for an opponent
        socket.emit(SEARCH_FOR_AN_OPPONENT, {
            userID: user._id,
            boardID: board._id
        })
    }

    // Listen for the opponent found event
    useEffect(() => {
        socket.on(OPPONENT_FOUND, ({ currentPlayer, opponentPlayer, currentTurn }) => {
            setOpponent(opponentPlayer.userDetail);
            console.log("AAYA OPPONENT_FOUND main");
            dispatch(setPlayer1(currentPlayer));
            dispatch(setPlayer2(opponentPlayer));
            dispatch(setMyBoard(board));
            dispatch(setCurrentTurn(currentTurn));

            // Navigate to the game room after 4 seconds
            setTimeout(() => {
                closeSearchModal();
                setOpenSearchModal(false);
                navigate('/game-room');
            }, 4000); // 4000 milliseconds = 4 seconds
        });

        // Error saving game in the database
        socket.on(ERROR_SAVING_GAME, ({ message }) => {
            toast.error(message);
            closeSearchModal();
            setOpponent(null);
        });

        // When the opponent is not found
        socket.on(OPPONENT_NOT_FOUND, () => {
            setOpponent(null);
        });

        // When the opponent leaves the match
        socket.on(OPPONENT_LEFT_MATCH_FROM_SERVER, () => {
            closeSearchModal();
            toast.error("Opponent left the match");
            //  Reset the game room state and prevent to navigate to the game room
            dispatch(resetGameRoom())
            // prevent to navigate to the game room
            navigate('/');
            setOpponent(null);
        });

        return () => {
            socket.off(OPPONENT_FOUND);
            socket.off(OPPONENT_NOT_FOUND);
            socket.off(OPPONENT_LEFT_MATCH_FROM_SERVER);
            socket.off(ERROR_SAVING_GAME);
        };
    }, [socket, dispatch, user._id, board._id]);


    // Play with a friend
    const playWithFriendHandler = () => {
        setOpenPlayWithFriendModal(true)
    }

    return (
        isLoading ? (
            <div>
                loading...
            </div>
        ) :
            <div className=" container mx-auto p-4">
                {
                    boards.length === 0 ? (
                        <div className='min-h-[90.2vh] flex flex-col justify-center items-center'>
                            <h1 className="text-yellow-500 text-2xl font-bold mb-6 text-center">No Boards found</h1>
                            <div className='flex flex-col gap-4'>
                                <Button
                                    variant='solid'
                                    color='primary'
                                    className='font-semibold'
                                    onPress={() => navigate('/create-board')}
                                >
                                    Create your first Board
                                </Button>
                                <Button
                                    variant='bordered'
                                    color='primary'
                                    className='font-semibold text-white'
                                    isLoading={isLoading}
                                    onPress={() => fetchBoards()}
                                >
                                    Try Again
                                </Button>
                            </div>

                        </div>
                    ) : (
                        <div className='min-h-[90.2vh]'>
                            <h1 className="text-yellow-500 text-2xl font-bold mb-6 text-center">All Boards</h1>
                            <div className="flex flex-wrap items-center justify-center gap-6">
                                {boards.map((board, index) => (
                                    <div key={index} className="flex flex-col items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg shadow-md">
                                        <Board
                                            heading={`Board ${index + 1}`}
                                            board={board.board}
                                            handleInputChange={() => { }} // Disable modification
                                            readOnly={true}
                                        />
                                        <Button
                                            variant='solid'
                                            className='font-semibold bg-yellow-300 text-black'
                                            onPress={() => useBoardHandler(board)}
                                        >
                                            Use this Board
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Modal for opening the game */}
                <Modal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    className='dark text-foreground'
                    size='4xl'
                    scrollBehavior='inside'
                    classNames={{
                        wrapper: "[--slide-exit:0px]",
                    }}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Game set-up</ModalHeader>
                                <ModalBody>
                                    <div className='flex flex-col md:flex-row  gap-5  justify-around'>
                                        <div className='flex flex-col gap-3'>
                                            <p className='text-lg'>You have chosen the following board:</p>
                                            <Board
                                                heading={`Chosen Board`}
                                                board={board.board}
                                                handleInputChange={() => { }} // Disable modification
                                                readOnly={true}
                                            />
                                        </div>
                                        <div className='w-full md:w-1/3 flex flex-col gap-3 items-center justify-center'>
                                            <p className='text-xl md:text-2xl'>Play Game using :</p>
                                            <Button
                                                className='text-medium md:font-semibold md:w-full'
                                                color='primary'
                                                variant='shadow'
                                                onClick={() => searchOpponentHandler()}
                                            >
                                                Search for an opponent
                                            </Button>

                                            <div className='flex  gap-2 items-center justify-center w-full'>
                                                <Divider className='bg-white w-1/3' />
                                                <span>OR</span>
                                                <Divider className='bg-white w-1/3' />
                                            </div>

                                            <Button
                                                className='text-medium md:font-semibold text-black md:w-full bg-yellow-300'
                                                variant='shadow'
                                                onClick={() => playWithFriendHandler()}
                                            >
                                                Play with a friend
                                            </Button>
                                        </div>
                                    </div>

                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="flat" onPress={onClose}>
                                        Close
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>


                {/* Modal for searching an opponent */}
                {
                    openSearchModal && (
                        <SearchOpponent
                            isOpen={openSearchModal}
                            onOpenChange={handleSearchModalOpenChange}
                            opponent={opponent}
                        />
                    )
                }

                {/* Modal for Play with friend */}
                {
                    openPlayWithFriendModal && (
                        <PlayWithFriend 
                            boardID={board._id}
                            isOpen={openPlayWithFriendModal}
                            onOpenChange={handlePlayWithFriendModalOpenChange}
                            setOpenSearchModal={setOpenSearchModal}
                            closePlayWithFriendModal={closePlayWithFriendModal}
                        />
                    )
                }

            </div>
    );
};

export default AllBoards;
