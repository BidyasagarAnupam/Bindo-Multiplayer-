import React, { useEffect, useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Divider, Input } from "@heroui/react";
import toast from 'react-hot-toast';
import { CREATE_ROOM, DESTROY_ROOM, JOIN_ROOM, OPPONENT_FOUND } from '../constants/events';
import { getSocket } from '../socket';
import { MdContentCopy } from "react-icons/md";

const PlayWithFriend = ({ isOpen, onOpenChange, boardID, setOpenSearchModal, closePlayWithFriendModal }) => {
    const socket = getSocket();

    const [roomID, setRoomID] = useState('')
    const [isRoomCreated, setIsRoomCreated] = useState(false)


    const createRoom = () => {
        const roomId = `room_${Math.random().toString(36).substring(2, 9)}`;

        console.log("Room ID: ", roomId);
        socket.emit(CREATE_ROOM, { roomId, boardID }, (response) => {
            if (response.success) {
                setRoomID(response.roomId);
                setIsRoomCreated(true);
                toast.success(`Room created! Share this ID: ${response.roomId}`);
            } else {
                toast.error(response.message);
            }
        });
    };

    const joinRoom = () => {
        if (!roomID) {
            toast.error('Please enter a valid Room ID!');
            return;
        }
        socket.emit(JOIN_ROOM, { boardID, roomId: roomID }, (response) => {
            if (response.success) {
                closePlayWithFriendModal()
                setOpenSearchModal(true) // todo
                toast.success('Joined room successfully!');
            } else {
                toast.error(response.message);
                setRoomID('');
            }
        });
    };

    useEffect(() => {
        socket.on(OPPONENT_FOUND, (data) => {
            console.log("Opponent Found: ", data);
            closePlayWithFriendModal()
            setOpenSearchModal(true) // todo
            toast.success('Joined room successfully!');
        });

        return () => {
            socket.off(OPPONENT_FOUND);
        }
    }, [socket])


    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomID).then(() => {
            toast.success("Room ID copied to clipboard!");
        }).catch(err => {
            toast.error("Failed to copy Room ID.");
        });
    };

    // Code for destroy room 
    const destroyRoom = () => {
        if (roomID) {
            socket.emit(DESTROY_ROOM, { roomId: roomID }, (response) => {
                if (response.success) {
                    setRoomID('');
                    toast.success('Room destroyed successfully!');
                } else {
                    toast.error(response.message);
                }
            });
            setIsRoomCreated(false);
        }
    }

    //  when the user refresh the page the room should be destroyed if it is created
    useEffect(() => {
        // Destroy the room when the user refreshes or leaves the page
        const handleBeforeUnload = () => {
            destroyRoom();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [roomID]);

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isDismissable={false}
            closeButton={isRoomCreated&&<></>}
            placement="auto"
            backdrop='blur'
            size={isRoomCreated ? 'md' : '2xl'}
            className='dark text-foreground'
            classNames={{
                wrapper: "[--slide-exit:0px]",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Play with a Friend 🤠</ModalHeader>
                        <ModalBody className='flex flex-col md:flex-row justify-between items-center'>
                            {
                                !isRoomCreated ?
                                    (
                                        <>
                                            <div className='w-full md:w-1/2 flex flex-col gap-2 justify-center'>
                                                <Button color='primary' onPress={createRoom}>
                                                    Create Room
                                                </Button>
                                            </div><p>OR</p><div className='w-full md:w-1/2 flex flex-col gap-2'>
                                                <Input
                                                    variant='bordered'
                                                    type="text"
                                                    label="Room Id"
                                                    placeholder="Enter Room Id..."
                                                    labelPlacement="inside"
                                                    value={roomID}
                                                    onChange={(e) => setRoomID(e.target.value)} />
                                                <Button
                                                    onPress={joinRoom}
                                                    className='text-sm font-semibold text-black w-full bg-yellow-300'
                                                >
                                                    Join Room
                                                </Button>
                                            </div>
                                        </>
                                    )
                                    : (
                                        <div className='flex flex-col gap-3 '>
                                            <p className='text-yellow-400 font-semibold'>Room Created! 🙌 </p>
                                            <p className='flex gap-2 items-center'>
                                                Share this ID with your friend:
                                                <span className='font-semibold'>{roomID}</span>
                                                <MdContentCopy className='cursor-pointer' size="20px" onClick={copyToClipboard} />
                                            </p>
                                        </div>
                                    )
                            }

                        </ModalBody>
                        <ModalFooter>
                            {isRoomCreated &&
                                <Button size='sm' color='danger' onPress={() => destroyRoom()}>
                                Destroy the Room
                            </Button>}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default PlayWithFriend