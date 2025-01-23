import React, { useState } from 'react';
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
    Link,
    Button
} from "@heroui/react";
import { NavbarLinks } from "../../data/navbar-links";
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar } from "@heroui/react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem
} from "@heroui/dropdown";
import { serverURL } from '../../constants/config';
import { userNotExists } from '../../redux/reducers/auth';
import toast from 'react-hot-toast';
import axios from 'axios';
import { BiSolidUserAccount } from "react-icons/bi";
import { IoSettings, IoLogOut } from "react-icons/io5";
import CoinIcon from '../../assets/coin.png'

const NavBar = ({
    setIsSignIn,
    setIsOpen
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useSelector((state) => state.auth)


    const dispatch = useDispatch()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogin = () => {
        setIsSignIn(true)
        setIsOpen(true)
    }

    const handleSignUp = () => {
        setIsSignIn(false)
        setIsOpen(true)
    }

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname);
    }


    const logoutHandler = async () => {
        try {
            const { data } = await axios.get(`${serverURL}/api/v1/profile/logout`, {
                withCredentials: true,
            });
            dispatch(userNotExists());
            localStorage.removeItem("user")
            toast.success(data.message);
        } catch (error) {
            console.log("Error", error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    }


    return (
        <>
            <Navbar onMenuOpenChange={setIsMenuOpen}>
                <NavbarContent>
                    <NavbarMenuToggle
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        className="sm:hidden"
                    />
                    <NavbarBrand>
                        {/* <AcmeLogo /> */}
                        <p className="font-bold text-inherit">BINGO</p>
                    </NavbarBrand>
                </NavbarContent>

                <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    {
                        NavbarLinks.map((item, index) => {
                            if (!user && item.auth) return null
                            return (
                                <NavbarItem key={`${item.id}`}>
                                    <Link color="foreground" href={`${item.path}`} className='flex flex-col'>
                                        {item.title}
                                        {
                                            matchRoute(item.path) && <span className='bg-yellow-300 h-1 w-full fill-left-to-right'></span>
                                        }
                                    </Link>

                                </NavbarItem>
                            )
                        })
                    }
                </NavbarContent>{
                    !user ? <NavbarContent justify="end">
                        <NavbarItem className="lg:flex">
                            <Button variant='light' onPress={handleLogin}>Login</Button>
                        </NavbarItem>
                        <NavbarItem>
                            <Button as={Link} color="primary" variant="flat" onPress={handleSignUp}>
                                Sign Up
                            </Button>
                        </NavbarItem>
                    </NavbarContent>
                        : (
                            <NavbarContent justify="end">
                                <div className='flex items-center gap-1 flex-row-reverse'>
                                    <img 
                                        src={`${CoinIcon}`}
                                        alt="coin"
                                        className='w-8 h-8'
                                    />
                                    {
                                        <p className='font-semibold'>{user.profileDetails.coins}</p>
                                    }
                                </div>
                                <Dropdown placement='bottom-start'>
                                    <DropdownTrigger>
                                        <Avatar
                                            className='cursor-pointer'
                                            isBordered src={user.profileDetails.avatar}
                                        />
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Static Actions">
                                        <DropdownSection>
                                            <DropdownItem key="userName" textValue='...'>
                                                <p className="font-medium text-medium">@{user?.userName}</p>
                                            </DropdownItem>
                                        </DropdownSection>
                                        <DropdownItem
                                            key="account"
                                            
                                            endContent={<BiSolidUserAccount className='text-xl' />}
                                            onClick={() => {
                                                setTimeout(() => {
                                                    navigate('/account/profile');
                                                }, 100); // Adjust the delay as needed
                                            }}
                                        >
                                            Account
                                        </DropdownItem>
                                        <DropdownItem
                                            key="edit"
                                            endContent={<IoSettings className='text-xl' />}
                                            onClick={() => {
                                                setTimeout(() => {
                                                    navigate('/account/settings');
                                                }, 100); // Adjust the delay as needed
                                            }}
                                        >
                                            Settings
                                        </DropdownItem>
                                        <DropdownItem
                                            key="delete"
                                            className="text-danger"
                                            color="danger"
                                            endContent={<IoLogOut className='text-xl' />}
                                            onClick={() => logoutHandler()}
                                        >
                                            Logout
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>

                            </NavbarContent>
                        )
                }

                <NavbarMenu className='dark text-foreground bg-slate-950'>
                    {NavbarLinks.map((item, index) => {
                        if (!user && item.auth) return null
                        return (
                            <NavbarMenuItem key={`${item}-${index}`} >
                                <Link color="foreground" href={`${item.path}`} className='flex flex-col'>
                                    {item.title}
                                    {
                                        matchRoute(item.path) && <span className='bg-yellow-300 h-1  fill-left-to-right-mobile'></span>
                                    }
                                </Link>
                            </NavbarMenuItem>
                        )
                    })}
                </NavbarMenu>
            </Navbar>

        </>

    );
}


export default NavBar