import React, { useState } from 'react';
import Board from '../components/common/Board';
import { Button } from "@nextui-org/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { Divider } from '@nextui-org/react';

const AllBoards = () => {
    // Dummy data for 5 boards, each with a 5x5 grid
    const [board, setBoard] = useState([[]]);
    const [openModal, setOpenModal] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const boards = [
        [
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20],
            [21, 22, 23, 24, 25]
        ],
        [
            [25, 24, 23, 22, 21],
            [20, 19, 18, 17, 16],
            [15, 14, 13, 12, 11],
            [10, 9, 8, 7, 6],
            [5, 4, 3, 2, 1]
        ],
        [
            [5, 10, 15, 20, 25],
            [4, 9, 14, 19, 24],
            [3, 8, 13, 18, 23],
            [2, 7, 12, 17, 22],
            [1, 6, 11, 16, 21]
        ],
        [
            [1, 3, 5, 7, 9],
            [2, 4, 6, 8, 10],
            [11, 13, 15, 17, 19],
            [12, 14, 16, 18, 20],
            [21, 23, 25, 24, 22]
        ],
        [
            [7, 14, 21, 8, 15],
            [16, 9, 2, 17, 10],
            [11, 18, 25, 12, 19],
            [20, 13, 6, 1, 24],
            [23, 5, 4, 22, 3]
        ]
    ];

    const useBoardHandler = (board) => {
        setBoard(board)
        onOpen()
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-yellow-500 text-2xl font-bold mb-6 text-center">All Boards</h1>
            <div className="flex flex-wrap items-center justify-center gap-6">
                {boards.map((board, index) => (
                    <div key={index} className="flex flex-col items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg shadow-md">
                        <Board
                            heading={`Board ${index + 1}`}
                            board={board}
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
                                <div className='flex gap-5  justify-around'>
                                    <div className='flex flex-col gap-3'>
                                        <p className='text-lg'>You have chosen the following board:</p>
                                        <Board
                                            heading={`Chosen Board`}
                                            board={board}
                                            handleInputChange={() => { }} // Disable modification
                                            readOnly={true}
                                        />
                                    </div>
                                    <div className='w-1/3 flex flex-col gap-3 items-center justify-center'>
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
