import './App.css';
import React, { Suspense, lazy, useEffect, useState, } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Link, Button, useDisclosure,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Checkbox, Input
} from "@nextui-org/react";
import { MailIcon } from "./components/common/icons/MailIcon";
import { EyeSlashFilledIcon } from './components/common/icons/EyeSlashFilledIcon';
import { EyeFilledIcon } from './components/common/icons/EyeFilledIcon';
import { UserNameIcon } from './components/common/icons/UserNameIcon';
import { useForm } from "react-hook-form";
import ProtectRoute from './auth/ProtectRoute'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { serverURL } from './constants/config';
import { isLoadingAuth, userExists, userNotExists } from './redux/reducers/auth';
import toast from 'react-hot-toast';
import { SocketProvider } from './socket';

const Home = lazy(() => import('./pages/Home'));
const CreateBoard = lazy(() => import('./pages/CreateBoard'));
const NavBar = lazy(() => import('./components/common/NavBar'));
const AllBoards = lazy(() => import('./pages/AllBoards'));
const HowToPlay = lazy(() => import('./pages/HowToPlay'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const GameRoom = lazy(() => import('./pages/GameRoom'));

const App = () => {

  const { user, loader } = useSelector((state) => state.auth);
  const [isSignIn, setIsSignIn] = useState(true)
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleSUpPass, setIsVisibleSUpPass] = useState(false);
  const [isVisibleSUpConfPass, setIsVisibleSUpConfPass] = useState(false);
  const { player1, player2, myBoard, currentTurn } = useSelector((state) => state.gameRoom)
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();
  const username = watch('username');

  // Fetching the user data
  useEffect(() => {
    const fetchData = async () => {
      const toastID = toast.loading("Fetching user data....")
      try {
        const data = await axios.get(`${serverURL}/api/v1/profile/my-profile`, { withCredentials: true })
        console.log("DATA", data);
        dispatch(userExists(data.user))
        localStorage.removeItem("user");
      } catch (error) {
        dispatch(userNotExists())
      }
      toast.dismiss(toastID)
    }
    if (!user) {
      fetchData()
    } {
      dispatch(isLoadingAuth(false))
    }
  }, [])

  // Function to check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (username) {
        try {
          const response = await axios.post(`${serverURL}/api/v1/user/username-check`, { userName: username });
          console.log("RESPONCE IS", response);
          clearErrors('username');
        } catch (error) {
          console.error('Error checking username:', error);
          if (error.response.data.message) {
            setError('username', {
              type: 'manual',
              message: error?.response?.data?.message,
            });
          }
        }
      }
    };

    // Debounce the API call to avoid excessive requests
    const timer = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(timer); // Cleanup timer on unmount or input change
  }, [username, setError, clearErrors]);

  const { onOpen } = useDisclosure();
  const [isOpen, setIsOpen] = useState(false);
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      // This is effectively your onClose function
      console.log("Modal is closing");
      // Perform any other close actions here
    }
  };
  // To close the modal from outside:
  const closeModal = () => {
    setIsOpen(false);
  };



  const toggleVisibility = (setFunction, variable) => setFunction(!variable);

  // Login Handler
  const loginHandler = async (data) => {
    const toastId = toast.loading("Signing In...");
    setIsLoading(true)

    //  Add API call to login
    const config = {
      withCredentials: true,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.post(
        `${serverURL}/api/v1/user/login`,
        {
          emailOrUsername: data.loginEmail,
          password: data.loginPsw,
        },
        config
      );
      console.count("Login check");

      console.log("Result", res);

      dispatch(userExists(res.data.user));

      localStorage.setItem("user", JSON.stringify(res.data.user))

      toast.success(res.data.message, {
        id: toastId,
      });
    } catch (error) {
      console.log("Login error", error);
      toast.error(error?.response?.data?.message || "Something Went Wrong", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
      closeModal();
    }

  }

  // Sign Up Handler
  const signUpHandler = async (data) => {
    const toastId = toast.loading("Signing Up...");
    setIsLoading(true)


    // check password and confirm password are same, otherwise show error using toast
    if (data.signupPassword !== data.signupCPassword) {
      toast.error("Password and Confirm Password do not match", {
        id: toastId,
      });
      return;
    }
    //  Add API call to sign up
    const config = {
      withCredentials: true,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.post(
        `${serverURL}/api/v1/user/new`,
        {
          userName: data.username,
          email: data.signupEmail,
          password: data.signupPassword,
        },
        config
      );

      console.log("Result", res);

      toast.success(res.data.message, {
        id: toastId,
      });
      reset()
      setIsSignIn(true)
    } catch (error) {
      console.log("Signup error", error);
      toast.error(error?.response?.data?.message || "Something Went Wrong", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
      console.log("Sign up data", data);
    }
  }

  // Dummy user
  // const user = false;

  return loader ? (
    <DotLottieReact
      src="https://lottie.host/753b35a4-05c3-49ea-bc26-6e7b6832df98/54SX878Rgh.json"
      loop
      autoplay
    />
  ) : (
    <>
      <Suspense fallback={
        <DotLottieReact
          src="https://lottie.host/753b35a4-05c3-49ea-bc26-6e7b6832df98/54SX878Rgh.json"
          loop
          autoplay
          className='minh-[92vh]'
        />
      }>
        <div className='dark:bg-slate-950 h-auto'>
          <NavBar
            setIsOpen={setIsOpen}
            setIsSignIn={setIsSignIn}
            user={user}
          />
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
            <Route
              path='/how-to-play'
              element={<HowToPlay />}
            />
            <Route
              path='/about'
              element={<AboutUs />}
            />
            <Route
              element={

                <ProtectRoute
                  user={user}
                  onOpen={onOpen}
                />
              }
            >
              <Route
                path="/create-board"
                element={<CreateBoard />}
              />

              <Route
                path="/all-boards"
                element={
                  <SocketProvider>
                    <AllBoards />
                  </SocketProvider>
                }
              />

              <Route
                path='/game-room'
                element={
                  player1 && player2 && myBoard && currentTurn ? (
                    <SocketProvider>
                      <GameRoom />
                    </SocketProvider>
                  ) : (
                    <Navigate to='/' />
                  )
                }
              />
            </Route>

          </Routes>
        </div>
      </Suspense>
      {/* Modal */}
      <Modal
        isDismissable={false}
        className='dark text-foreground'
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        placement="auto"
        backdrop='blur'
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
                        isInvalid={errors.loginEmail ? true : false}
                        id='loginEmail'
                        {...register("loginEmail", {
                          required: "Email is required",
                        })}
                        endContent={
                          <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                        }
                        label={<><span>Email or Username</span><span style={{ color: "red", fontSize: "20px" }}> *</span></>}
                        placeholder="Enter your email or username"
                        variant="bordered"
                      />
                      {errors.loginEmail && (
                        <span className="ml-2 text-xs tracking-wide text-pink-700">
                          {errors.loginEmail.message}
                        </span>
                      )}
                      <Input
                        label={<><span>Password</span><span style={{ color: "red", fontSize: "20px" }}> *</span></>}
                        variant="bordered"
                        name='loginPsw'
                        isInvalid={errors.loginPsw ? true : false}
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
                      <Button color="primary" type='submit' isLoading={isLoading}>
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
                        isInvalid={errors.username ? true : false}
                        name='username'
                        id='username'
                        {...register("username", {
                          required: "Username is required",
                          pattern: {
                            value: /^[a-zA-Z0-9]+$/,
                            message: "Username should not contain special characters"
                          }
                        })}
                        endContent={
                          <UserNameIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                        }
                        label="User Name"
                        placeholder="Enter your username"
                        variant="bordered"

                      />
                      {errors.username && (
                        <span className="ml-2 text-xs tracking-wide text-pink-700">
                          {errors.username.message}
                        </span>
                      )}
                      <Input
                        type="text"
                        name="signupEmail"
                        isInvalid={errors.signupEmail ? true : false}
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
                        isInvalid={errors.signupCPassword ? true : false}
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
                      <Button color="primary" type='submit' isLoading={isLoading}>
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
};

export default App