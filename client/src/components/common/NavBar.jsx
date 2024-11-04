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
} from "@nextui-org/react";
import { NavbarLinks } from "../../data/navbar-links";
import { matchPath, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar } from "@nextui-org/react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem
} from "@nextui-org/dropdown";
import { serverURL } from '../../constants/config';
import { userNotExists } from '../../redux/reducers/auth';
import toast from 'react-hot-toast';
import axios from 'axios';

const NavBar = ({
    setIsSignIn,
    setIsOpen
}) => {

    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()

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

    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                            if(!user && item.auth) return null
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
                                <Dropdown placement='bottom-start'>
                                    <DropdownTrigger>
                                        <Avatar
                                            className='cursor-pointer'
                                            isBordered src={user.profileDetails.avatar}
                                        />
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Static Actions">
                                        <DropdownSection>
                                            <DropdownItem key="profile">
                                                <p className="font-medium text-medium">@{user?.userName}</p>
                                            </DropdownItem>
                                        </DropdownSection>
                                        <DropdownItem key="new">Profile</DropdownItem>
                                        <DropdownItem key="edit">Setting</DropdownItem>
                                        <DropdownItem key="delete" className="text-danger" color="danger"
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
                        if(!user && item.auth) return null
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