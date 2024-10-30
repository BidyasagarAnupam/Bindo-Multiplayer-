import React, { useState } from 'react'
import {
    Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button, useDisclosure,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Checkbox, Input
} from "@nextui-org/react";
// import { AcmeLogo } from "./AcmeLogo.jsx";
import { NavbarLinks } from "../../data/navbar-links";
import { matchPath, useLocation } from 'react-router-dom';
import { MailIcon } from "../common/MailIcon";
import { EyeSlashFilledIcon } from './EyeSlashFilledIcon';
import { EyeFilledIcon } from './EyeFilledIcon';
import { UserNameIcon } from './UserNameIcon';
import { useForm } from "react-hook-form";

const NavBar = () => {

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset,
        formState: { errors },
    } = useForm();

    const [isSignIn, setIsSignIn] = useState(true)
    const [isVisible, setIsVisible] = useState(false);
    const [isVisibleSUpPass, setIsVisibleSUpPass] = useState(false);
    const [isVisibleSUpConfPass, setIsVisibleSUpConfPass] = useState(false);

    const toggleVisibility = (setFunction, variable) => setFunction(!variable);

    const handleLogin = () => {
        setIsSignIn(true)
        onOpen()
    }

    const handleSignUp = () => {
        setIsSignIn(false)
        onOpen()
    }

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname);
    }

    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const menuItems = [
        "Home",
        "Create Board"
    ];

    const loginHandler = async (data) => {
        const formData = new FormData()
        formData.append('email', data.loginEmail)
        formData.append('password', data.loginPsw)

        // TODO: Add API call to login
        console.log("Login Form Data", data);

    }

    const signUpHandler = async (data) => {
        const formData = new FormData()

        formData.append('username', data.username)
        formData.append('email', data.signupEmail)
        formData.append('password', data.signupPassword)
        formData.append('confirmPassword', data.signupCPassword)

        // TODO: Add API call to sign up

        console.log("Sign up data", data);



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
                        NavbarLinks.map((item, index) => (
                            <NavbarItem key={`${item.id}`}>
                                <Link color="foreground" href={`${item.path}`} className='flex flex-col'>
                                    {item.title}
                                    {
                                        matchRoute(item.path) && <span className='bg-yellow-300 h-1 w-full fill-left-to-right'></span>
                                    }
                                </Link>

                            </NavbarItem>
                        ))
                    }
                </NavbarContent>
                <NavbarContent justify="end">
                    <NavbarItem className="lg:flex">
                        <Button variant='light' onPress={handleLogin}>Login</Button>
                    </NavbarItem>
                    <NavbarItem>
                        <Button as={Link} color="primary" variant="flat" onPress={handleSignUp}>
                            Sign Up
                        </Button>
                    </NavbarItem>
                </NavbarContent>
                <NavbarMenu className='dark text-foreground bg-slate-950'>
                    {NavbarLinks.map((item, index) => (
                        <NavbarMenuItem key={`${item}-${index}`} >
                            <Link color="foreground" href={`${item.path}`} className='flex flex-col'>
                                {item.title}
                                {
                                    matchRoute(item.path) && <span className='bg-yellow-300 h-1  fill-left-to-right-mobile'></span>
                                }
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </NavbarMenu>
            </Navbar>
            {/* Modal */}
            <Modal
                isDismissable={false}
                className='dark text-foreground'
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="auto"
                classNames={{
                    wrapper: "[--slide-exit:0px]",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{`${isSignIn ? 'Log in' : 'Sign Up'}`}</ModalHeader>
                            {
                                isSignIn ? (

                                    <form
                                        onSubmit={handleSubmit(loginHandler)}
                                        className='flex flex-col gap-3'>
                                        <ModalBody>
                                            <Input
                                                name='loginEmail'
                                                id='loginEmail'
                                                {...register("loginEmail", { required: true })}
                                                endContent={
                                                    <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                }
                                                label={<><span>Email</span><span style={{ color: "red", fontSize: "20px" }}> *</span></>}
                                                placeholder="Enter your email"
                                                variant="bordered"
                                            />
                                            {errors.loginEmail && (
                                                <span className="ml-2 text-xs tracking-wide text-pink-700">
                                                    Email is required
                                                </span>
                                            )}
                                            <Input
                                                label={<><span>Password</span><span style={{ color: "red", fontSize: "20px" }}> *</span></>}
                                                variant="bordered"
                                                name='loginPsw'
                                                id='loginPsw'
                                                {...register("loginPsw", { required: true })}
                                                placeholder="Enter your password"
                                                endContent={
                                                    <button className="focus:outline-none" type="button" onClick={() => toggleVisibility(setIsVisible, isVisible)} aria-label="toggle password visibility">
                                                        {isVisible ? (
                                                            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                                        ) : (
                                                            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                                        )}
                                                    </button>
                                                }
                                                type={isVisible ? "text" : "password"}
                                            />
                                            {errors.loginPsw && (
                                                <span className="ml-2 text-xs tracking-wide text-pink-700">
                                                    Password is required
                                                </span>
                                            )}
                                            <div className="flex py-2 px-1 justify-between">
                                                <Checkbox
                                                    classNames={{
                                                        label: "text-small",
                                                    }}
                                                >
                                                    Remember me
                                                </Checkbox>
                                                <Link color="primary" href="#" size="sm">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="danger" variant="flat" onPress={onClose}>
                                                Close
                                            </Button>
                                            <Button color="primary" type='submit'>
                                                Sign in
                                            </Button>
                                        </ModalFooter>
                                    </form>
                                ) : (

                                    <form
                                        onSubmit={handleSubmit(signUpHandler)}
                                        className='flex  flex-col gap-3'>
                                        <ModalBody>
                                            <Input
                                                type='text'
                                                name='username'
                                                id='username'
                                                {...register("username", { required: true })}
                                                endContent={
                                                    <UserNameIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                }
                                                label="User Name"
                                                placeholder="Enter your username"
                                                variant="bordered"
                                            />
                                            {errors.username && (
                                                <span className="ml-2 text-xs tracking-wide text-pink-700">
                                                    Username is required
                                                </span>
                                            )}
                                            <Input
                                                type="text"
                                                name="signupEmail"
                                                id="signupEmail"
                                                {...register("signupEmail", {
                                                    required: "Email is required",
                                                    pattern: {
                                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                        message: "Please enter a valid email address"
                                                    }
                                                })}
                                                endContent={
                                                    <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                }
                                                label="Email"
                                                placeholder="Enter your email"
                                                variant="bordered"
                                            />
                                            {errors.signupEmail && (
                                                <span className="ml-2 text-xs tracking-wide text-pink-700">
                                                    {errors.signupEmail.message}
                                                </span>
                                            )}
                                            <Input
                                                label="Password"
                                                variant="bordered"
                                                name="signupPassword"
                                                id="signupPassword"
                                                {...register("signupPassword", { required: "Password is required" })}
                                                placeholder="Enter your password"
                                                endContent={
                                                    <button
                                                        className="focus:outline-none"
                                                        type="button"
                                                        onClick={() => toggleVisibility(setIsVisibleSUpPass, isVisibleSUpPass)}
                                                        aria-label="toggle password visibility"
                                                    >
                                                        {isVisibleSUpPass ? (
                                                            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                                        ) : (
                                                            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                                        )}
                                                    </button>
                                                }
                                                type={isVisibleSUpPass ? "text" : "password"}
                                            />
                                            {errors.signupPassword && (
                                                <span className="ml-2 text-xs tracking-wide text-pink-700">
                                                    {errors.signupPassword.message}
                                                </span>
                                            )}

                                            <Input
                                                label="Confirm Password"
                                                variant="bordered"
                                                name="signupCPassword"
                                                id="signupCPassword"
                                                {...register("signupCPassword", {
                                                    required: "Confirm Password is required",
                                                    validate: (value) =>
                                                        value === watch("signupPassword") || "Confirm Password do not match with Password",
                                                })}
                                                placeholder="Enter your password again"
                                                endContent={
                                                    <button
                                                        className="focus:outline-none"
                                                        type="button"
                                                        onClick={() => toggleVisibility(setIsVisibleSUpConfPass, isVisibleSUpConfPass)}
                                                        aria-label="toggle password visibility"
                                                    >
                                                        {isVisibleSUpConfPass ? (
                                                            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                                        ) : (
                                                            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                                        )}
                                                    </button>
                                                }
                                                type={isVisibleSUpConfPass ? "text" : "password"}
                                            />
                                            {errors.signupCPassword && (
                                                <span className="ml-2 text-xs tracking-wide text-pink-700">
                                                    {errors.signupCPassword.message}
                                                </span>
                                            )}
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="danger" variant="flat" onPress={onClose}>
                                                Close
                                            </Button>
                                            <Button color="primary" type='submit'>
                                                Sign Up
                                            </Button>
                                        </ModalFooter>
                                    </form>
                                )
                            }
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>

    );
}


export default NavBar