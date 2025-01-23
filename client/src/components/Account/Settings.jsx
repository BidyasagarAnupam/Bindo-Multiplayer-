import { Avatar, Button, DatePicker, Input, Select, SelectItem } from "@heroui/react";
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { serverURL } from '../../constants/config';
import { userExists } from '../../redux/reducers/auth';
import { useNavigate } from 'react-router-dom';
import ProfilePicUpdate from './UpdateProfilePicture/ProfilePicUpdate';

const Settings = () => {
  useDocumentTitle("Settings | Account | Bingo");


  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch();
  const navigate = useNavigate()
  // console.log("User ", user);

  const [displayName, setDisplayName] =
    useState(user.profileDetails.displayName ? user.profileDetails.displayName : undefined);
  const [gender, setGender] =
    useState(user.profileDetails.gender ? user.profileDetails.gender : undefined);
  const [dob, setDob] =
    useState(user.profileDetails.dob ? parseDate(formatDate(user.profileDetails.dob)) : "");
  const [isChanged, setIsChanged] = useState(false);


  const genders = [
    { key: "Male", label: "Male" },
    { key: "Female", label: "Female" },
    { key: "Other", label: "Other" }
  ];
  const setGenderFunction = (e) => {
    setGender(e.target.value);
  }

  // check the dob like .day, .month, .year
  useEffect(() => {
    // Check if any value has changed
    if (
      displayName !== user.profileDetails.displayName ||
      gender !== user.profileDetails.gender ||
      dob.day !== (user.profileDetails.dob ? parseDate(formatDate(user.profileDetails.dob)).day : undefined) ||
      dob.month !== (user.profileDetails.dob ? parseDate(formatDate(user.profileDetails.dob)).month : undefined) ||
      dob.year !== (user.profileDetails.dob ? parseDate(formatDate(user.profileDetails.dob)).year : undefined)

    ) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [displayName, gender, dob]);

  const saveChangesHandler = async () => {
    const toastId = toast.loading("Saving changes...");
    if (!displayName || !gender || !dob) {
      toast.error("Please fill all the fields", { id: toastId });
      return;
    }
    let updateDOB = dob.toDate(getLocalTimeZone());

    try {
      const res = await axios.post(`${serverURL}/api/v1/profile/update-profile`,
        { displayName, gender, dob: updateDOB },
        { withCredentials: true }
      )
      // update the user in the redux store and local storage
      dispatch(userExists(res.data.user));
      localStorage.setItem("user", JSON.stringify(res.data.user))
      toast.success(res.data.message, { id: toastId });
      navigate("/account/profile");

    } catch (error) {
      console.log("Error", error);
      toast.error(error?.response?.data?.message || "Something went wrong", {
        id: toastId,
      });
    }
  }

  return (
    <div className='flex flex-col gap-3  h-full lg:h-2/3'>
      {/* profile picture, user name and email */}
      <ProfilePicUpdate src={user.profileDetails.avatar} userName={user.userName} email={user.email} />
      {/* and all details */}
      <div className='h-5/6  flex flex-col md:flex-row gap-3'>
        <div className='bg-[#18181bda] w-full  md:w-1/2 h-full rounded-lg p-3 flex flex-col justify-around'>
          <Input
            size='lg'
            label={<span>Display Name <span className='text-red-600'>*</span> </span>}
            required
            placeholder="Not Set yet, type here to set"
            value={displayName}
            onValueChange={setDisplayName}
            labelPlacement="outside"
          // color={`${user.profileDetails.displayName ? 'default' : 'warning'}`}
          />
          <Select
            // className="max-w-xs"
            size='lg'
            label=<span>Select your gender <span className='text-red-600'>*</span> </span>
            selectedKeys={[gender]}
            onChange={setGenderFunction}
            labelPlacement='outside'
            placeholder='Your Gender'
          >
            {genders.map((gender) => (
              <SelectItem key={gender.key}>{gender.label}</SelectItem>
            ))}
          </Select>
          <DatePicker
            size='lg'
            showMonthAndYearPickers
            label=<span>Date of Birth <span className='text-red-600'>*</span> </span>
            value={dob ? dob : undefined}
            onChange={setDob}
            labelPlacement='outside'
          />

          <Button
            color='primary'
            isDisabled={!isChanged}
            className={`mt-2 md:mt-0 `}
            onPress={() => saveChangesHandler()}
          >
            Save Changes
          </Button>

        </div>

        <div className='bg-[#18181bda] opacity-30 w-full  md:w-1/2 h-full rounded-lg p-3 flex flex-col justify-around'>
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

export default Settings

// Write a function to give proper date format with a date object as input
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
