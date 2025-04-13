import { Avatar, Input } from "@heroui/react";
import React from 'react'
import { useSelector } from 'react-redux'
import useDocumentTitle from '../../hooks/useDocumentTitle';

const Profile = () => {
  useDocumentTitle("Profile | Account | Bingo");


  const { user } = useSelector((state) => state.auth)

  return (
    <div className='flex flex-col gap-3  h-auto lg:h-2/3'>
      {/* profile picture, user name and email */}
      <div className='w-full bg-[#18181bda] rounded-lg px-3 py-5 flex gap-2 md:gap-10 items-center md:pl-10'>
        <Avatar
          // size='lg'
          isBordered
          color='primary'
          className='h-6 w-6 md:h-10 md:w-10 lg:h-24 lg:w-24'
          src={user.profileDetails.avatar} 
          />
        <div className='flex flex-col gap-1 ml-4'>
          <p className='text-xl font-bold text-white'>@{user.userName}</p>
          <p className='text-md text-default-400'>{user.email}</p>
          </div>
      </div>
      {/* and all details */}
      <div className=' flex flex-col md:flex-row gap-3'>
        <div className='bg-[#18181bda] w-full  md:w-1/2 h-full rounded-lg p-5 flex flex-col gap-4'>
          <Input
            isReadOnly
            size='lg'
            label="Display Name"
            value={user.profileDetails.displayName ? user.profileDetails.displayName : "Not Set, go to settings to set"}
            labelPlacement="outside"
            color={`${user.profileDetails.displayName ? 'default' : 'warning'}`}
          />
          <Input
            isReadOnly
            size='lg'
            label="Gender"
            value={user.profileDetails.gender ? user.profileDetails.gender : "Not Set, go to settings to set"}
            labelPlacement="outside"
            color={`${user.profileDetails.gender ? 'default' : 'warning'}`}
          />
          <Input
            isReadOnly
            size='lg'
            label="Date of Birth"
            value={user.profileDetails.dob ? formatDate(user.profileDetails.dob) : "Not Set, go to settings to set"}
            labelPlacement="outside"
            color={`${user.profileDetails.dob ? 'default' : 'warning'}`}
          />
        </div>
        <div className='bg-[#18181bda] w-full  md:w-1/2 h-full rounded-lg p-5 flex flex-col gap-4 overflow-y-auto'>
          <Input
            isReadOnly
            size='lg'
            label="Total Games Played"
            value={user.profileDetails.totalGamePlayed ? user.profileDetails.totalGamePlayed : "Play Games to see the count"}
            labelPlacement="outside"
            color={`${user.profileDetails.totalGamePlayed ? 'default' : 'warning'}`}
          />
          <Input
            isReadOnly
            size='lg'
            label="Total Games Won"
            value={user.profileDetails.totalGameWon ? user.profileDetails.totalGameWon : "Play Games to see the count"}
            labelPlacement="outside"
            color={`${user.profileDetails.totalGameWon ? 'default' : 'warning'}`}
          />
          <Input
            isReadOnly
            size='lg'
            label="Coins"
            value={user.profileDetails.coins ? user.profileDetails.coins : "Play Games to earn coins"}
            labelPlacement="outside"
            color={`${user.profileDetails.coins ? 'default' : 'warning'}`}
          />
        </div>
      </div>
    </div>
  )
}

export default Profile

// Write a function to give proper date format with a date object as input
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};