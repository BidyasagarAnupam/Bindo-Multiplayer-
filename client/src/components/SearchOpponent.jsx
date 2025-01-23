import React, { useEffect, useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar, CircularProgress } from "@heroui/react"
import { useSelector } from 'react-redux'
import SearchGif from '../assets/searching.gif'
import VsGif from '../assets/vs.gif'
import { getSocket } from '../socket'
import { OPPONENT_NOT_FOUND } from '../constants/events'
import toast from 'react-hot-toast'

const SearchOpponent = ({ isOpen, onOpenChange, opponent }) => {
  const { user } = useSelector((state) => state.auth)
  const [seconds, setSeconds] = useState(3)
  const [timeRemaining, setTimeRemaining] = useState(20)

  const socket = getSocket();

  useEffect(() => {
    // when the opponent is found, start the timer
    let interval;
    if (opponent) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [opponent])

  useEffect(() => {
    // when the opponent is found, start the timer
    let interval;
    if (!opponent) {
      console.log("Chal raha hai");
      interval = setInterval(() => {
        setTimeRemaining(timeRemaining => timeRemaining - 1)
      }, 1000)

      
    }
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (timeRemaining === 0) {
      console.log("socket id", socket.id);
      socket.emit(OPPONENT_NOT_FOUND, { socketId: socket.id })
      onOpenChange(false)
      toast.error("No Opponent found, try again later...")
    }
  },[timeRemaining])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
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
            <ModalHeader className="flex flex-col gap-1">{opponent ? "Opponent found" : "Searching for the opponent"}</ModalHeader>
            <ModalBody>
              <div className='flex justify-around items-center '>
                <div className='flex items-center flex-col gap-1'>
                  <Avatar
                    isBordered
                    color="primary"
                    src={user.profileDetails.avatar}
                    className="w-20 h-20 text-large"
                    radius='md'
                  />
                  <div >{user?.userName}</div>
                </div>
                <Avatar
                  size='lg'
                  radius='md' src={VsGif}
                />

                <div className='flex items-center flex-col gap-1'>
                  <Avatar
                    className="w-20 h-20 text-large"
                    radius='md'
                    isBordered
                    color="warning"
                    src={opponent ? opponent.profileDetails.avatar : SearchGif}

                  />
                  <div>
                    {opponent ? opponent.userName : "Searching..."}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {
                opponent ?
                <div className='flex items-center justify-center gap-1'>
                    <p className='text-lg space-y-2 text-white'>Creating your rooms...</p>
                  <CircularProgress
                    classNames={{
                      svg: "w-16 h-16 drop-shadow-md",
                      indicator: "stroke-white",
                      track: "stroke-[#333] dark:stroke-[#555]",
                      value: "text-sm font-semibold text-white",
                    }}
                    aria-label="Loading..."
                    value={seconds}
                    maxValue={3}
                    strokeWidth={3}
                    formatOptions={{ style: 'unit', unit: 'second' }}
                      showValueLabel={true}
                  />
                  </div> 
                  :
                  (
                    <div className='flex items-center justify-center gap-1'>
                      <p className='text-sm space-y-2 text-white'>Time remaining...</p>
                      <CircularProgress
                        classNames={{
                          svg: "w-16 h-16 drop-shadow-md",
                          indicator: "stroke-white",
                          track: "stroke-[#333] dark:stroke-[#555]",
                          value: "text-xs font-semibold text-white",
                        }}
                        aria-label="Loading..."
                        value={timeRemaining}
                        maxValue={20}
                        strokeWidth={3}
                        formatOptions={{ style: 'unit', unit: 'second' }}
                        showValueLabel={true}
                      />
                    </div>
                  )
              }
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default SearchOpponent