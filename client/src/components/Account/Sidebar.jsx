import React, { useEffect, useState } from 'react'
import {
  Button,
  Tooltip,
  useDisclosure,
} from "@heroui/react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/drawer"
import { sidebarLinks } from '../../data/sidebar-links';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import * as Icon from 'react-icons/ri'
import { useMediaQuery } from 'react-responsive'

const Sidebar = ({ isOpen, setIsOpen }) => {
  // const { onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });


  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <>
      {
        !isOpen &&
        <div className={` flex dark overflow-y-auto fixed
        p-1
        md:p-3 bg-[#18181b] rounded-md
        ${isMobile ?
            'bottom-0 left-0 right-0 w-full z-50 flex-row h-12  items-center justify-between' :
            "flex-col justify-around items-center h-[70vh]"}
        `}>
          <Tooltip content="Open menu">
            <Button
              isIconOnly
              className="text-default-400"
              size="sm"
              variant="light"
              onPress={
                () => {
                  setIsOpen(true)
                }
              }
            >
              <svg
                fill="none"
                height="20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
              </svg>
            </Button>
          </Tooltip>
          {
            sidebarLinks.map((link) => (
              <div
                key={link.id}
                className={`flex items-center justify-center gap-3 text-xl cursor-pointer
            hover:bg-default-200/20 p-2 rounded-md hover:text-slate-500
            ${matchRoute(link.path) && 'bg-default-200/20 text-slate-500'}
            `}
                onClick={() => {
                  navigate(link.path)
                }}
              >
                <SetIcon icon={link.icon} />
              </div>
            ))
          }
        </div>
      }

      <Drawer
        size='xs'
        classNames={{
          base: "max-w-[250px]",
        }}
        // isDismissable={false}
        // isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement='left'
        // backdrop='transparent'
        className='dark  text-white'
      >
        <DrawerContent
        >
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-row-reverse gap-2 px-2 py-2 border-b border-default-200/50 justify-between  backdrop-blur-lg">

                <Tooltip content="Close">
                  <Button
                    isIconOnly
                    className="text-default-400"
                    size="sm"
                    variant="light"
                    onPress={onClose}
                  >
                    <svg
                      fill="none"
                      height="20"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11 7l-5 5 5 5M18 7l-5 5 5 5" />
                    </svg>

                  </Button>
                </Tooltip>
                <p>Menu Bar</p>
              </DrawerHeader>
              <DrawerBody>
                <div className='flex flex-col justify-around h-2/4'>
                  {
                    sidebarLinks.map((link) => (
                      <div
                        key={link.id}
                        className={`flex items-center justify-center gap-3 text-xl cursor-pointer
                        hover:bg-default-200/20 p-2 rounded-md hover:text-slate-500
                        ${matchRoute(link.path) && 'bg-default-200/20 text-slate-500'}
                        `}
                        onClick={() => {
                          navigate(link.path)

                        }}
                      >
                        <SetIcon icon={link.icon} />
                        {link.name}
                      </div>
                    ))
                  }
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}

const SetIcon = ({ icon }) => {
  const IconComponent = Icon[icon]
  return <IconComponent />
}

export default Sidebar