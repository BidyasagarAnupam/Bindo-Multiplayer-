import React from 'react'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button } from "@nextui-org/react";
// import { AcmeLogo } from "./AcmeLogo.jsx";
import { NavbarLinks } from "../../data/navbar-links";
import { matchPath, useLocation } from 'react-router-dom';

const NavBar = () => {

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname);
    }

    const location = useLocation()
    console.log("location", location.pathname);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const menuItems = [
        "Home",
        "Create Board"
    ];
    return (
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
                <NavbarItem className="hidden lg:flex">
                    <Link href="#">Login</Link>
                </NavbarItem>
                <NavbarItem>
                    <Button as={Link} color="primary" href="#" variant="flat">
                        Sign Up
                    </Button>
                </NavbarItem>
            </NavbarContent>
            <NavbarMenu className='dark text-foreground bg-slate-950'>
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item}-${index}`} >
                        <Link
                            color={
                                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
                            }
                            className="w-full"
                            href="#"
                            size="lg"
                        >
                            {item}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    );
}

export default NavBar