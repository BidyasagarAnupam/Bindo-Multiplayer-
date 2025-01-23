import { Avatar, Button, Tooltip } from "@heroui/react"
import React, { useEffect, useRef, useState } from 'react'
import { FaCamera } from "react-icons/fa";
import CropModal from "./CropModal";
import { MdFileUpload } from "react-icons/md";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../../../constants/config";
import axios from "axios";
import { useDispatch } from "react-redux";
import { userExists } from "../../../redux/reducers/auth";

const MIN_DIMENSION = 150;

const ProfilePicUpdate = ({ src, userName, email }) => {

    const navigate = useNavigate()
    const dispatch = useDispatch();


    const [previewSource, setPreviewSource] = useState(null)
    const [imgSrc, setImgSrc] = useState("");
    const [imageFile, setImageFile] = useState(null)
    const [error, setError] = useState("");
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpenChange = (open) => {
        console.log("AAYA IDHAR value is ", open);
        setIsCropModalOpen(open);
        if (!open) {
            // This is effectively your onClose function
        }
    };
    // To close the modal from outside:
    const closeModal = () => {
        setIsCropModalOpen(false);
    };


    const fileInputRef = useRef(null)

    const handleClick = () => {
        fileInputRef.current.click()
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return;
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const imageElement = new Image();
            const imageUrl = reader.result?.toString() || "";
            imageElement.src = imageUrl;

            imageElement.addEventListener("load", (e) => {
                if (error) setError("");
                const { naturalWidth, naturalHeight } = e.currentTarget;
                if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
                    setError("Image must be at least 150 x 150 pixels.");
                    return setImgSrc("");
                }
            });
            setImgSrc(imageUrl);
            // console.log("Image URL", imageUrl);

        });
        console.log("File change hua");
        reader.readAsDataURL(file);
        // setImageModal(true);
        setIsCropModalOpen(true);
    }

    const updateAvatar = (imgSrc) => {
        const reader = new FileReader()
        reader.readAsDataURL(imgSrc)

        reader.onloadend = () => {
            setPreviewSource(reader.result)
        }
        setImgSrc(imgSrc)
    };

    const previewFile = (file) => {
        setPreviewSource(file)
    }

    useEffect(() => {
        if (imageFile) {
            previewFile(imageFile)
        }
    }, [imageFile])

    // POST request to update the profile picture
    const handleFileUpload = async () => {
        const toastId = toast.loading("Uploading profile picture, Please wait and dont refresh...");
        setLoading(true);
        const formData = new FormData()
        formData.append('profilePicture', imgSrc)
        console.log("check imageSRC",imgSrc instanceof File); // Should return true

        // console.log("FormData", imgSrc);
        try {
            const res = await axios.post(`${serverURL}/api/v1/profile/update-profilePicture`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
            console.log("Res", res);
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
        } finally {
            setLoading(false);
        }


    }

    return (
        <>
            <div className='h-1/4 w-full bg-[#18181bda] rounded-lg p-3 flex flex-col  md:flex-row gap-2 md:gap-4 md:items-center md:p-4 md:pl-10'>
                <div className="flex gap-5 items-center">
                    <div className='relative'>
                        <Avatar
                            size='lg'
                            isBordered
                            color='primary'
                            alt={userName}
                            className='h-20 w-20 lg:h-24 lg:w-24'
                            src={previewSource || src} />
                        <Tooltip content="Edit your Profile Picture">
                            <div className='absolute right-1 bottom-1 cursor-pointer' onClick={handleClick}>
                                <FaCamera className='text-2xl text-slate-50' />
                            </div>
                        </Tooltip>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onClick={(e) => (e.target.value = null)}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/gif, image/jpeg"
                        />
                    </div>
                    {
                        previewSource &&
                        <Button
                            endContent={<MdFileUpload className="text-lg" />}
                                onPress={handleFileUpload}
                                disabled={loading}
                                isLoading={loading}
                        >
                            Upload
                        </Button>
                    }
                </div>

                <div className='flex flex-col gap-1 ml-4'>
                    <p className='text-xl font-bold text-white'>@{userName}</p>
                    <p className='text-md text-default-400'>{email}</p>
                </div>
            </div>
            {
                <CropModal
                    imageSrc={imgSrc}
                    isOpen={isCropModalOpen}
                    onClose={closeModal}
                    onOpenChange={handleOpenChange}
                    updateAvatar={updateAvatar}
                />

            }
        </>
    )
}

export default ProfilePicUpdate