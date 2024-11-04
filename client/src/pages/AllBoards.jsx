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

const AllBoards = () => {
    useDocumentTitle("All Boards | Bingo");

    // Dummy data for 5 boards, each with a 5x5 grid
    const [board, setBoard] = useState([[]]);
    const [openModal, setOpenModal] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [boards, setBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
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
                console.log("All boards are", res.data.boards);
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
        fetchBoards()
    }, [])

    const useBoardHandler = (board) => {
        setBoard(board)
        onOpen()
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
                            <Button
                                variant='solid'
                                color='primary'
                                className='font-semibold'
                                onPress={() => navigate('/create-board')}
                            >
                                Create your first Board
                            </Button>
                        </div>
                    ) : (
                            <div className='min-h-screen'>
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
                                            onPress={() => useBoardHandler(board.board)}
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
                    size='5xl'
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
                                                board={board}
                                                handleInputChange={() => { }} // Disable modification
                                                readOnly={true}
                                            />
                                        </div>
                                        <div className='w-full md:w-1/3 flex flex-col gap-3 items-center justify-center'>
                                            <p className='text-2xl font-semibold'>Play Game using:</p>
                                            <Button
                                                className='text-xl font-semibold w-full'
                                                color='primary'
                                                variant='shadow'
                                                onClick={() => console.log(board)}
                                            >
                                                Search for an opponent
                                            </Button>

                                            <div className='flex  gap-2 items-center justify-center w-full'>
                                                <Divider className='bg-white w-1/3' />
                                                <span>OR</span>
                                                <Divider className='bg-white w-1/3' />
                                            </div>

                                            <Button
                                                className='text-xl font-semibold text-black w-full bg-yellow-300'
                                                variant='shadow'
                                                onClick={() => console.log("ok")}
                                            >
                                                Invite a friend
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
            </div>
    );
};

export default AllBoards;
