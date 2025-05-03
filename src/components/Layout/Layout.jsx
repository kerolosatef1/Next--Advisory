import React, { useEffect, useState } from "react";
import Style from './Layout.module.css';
import { Outlet, useLocation } from "react-router-dom";
import Navbar from './../Navbar/Navbar';
import Footer from './../Footer/Footer';
import { SiDedge } from "react-icons/si";
import { slider } from "@material-tailwind/react";




export default function Layout(){
    const location=useLocation();
    const hideNavbarAndFooter = ['/login','/', '/register','/resetpassword','/forgetpassword','/proffesors','/teachingassistant','/courses','/halls'];
    const shouldHide = hideNavbarAndFooter.includes(location.pathname.toLowerCase());
    useEffect(() => {},[]);
    return <>

{!shouldHide && <Navbar /> }
 <Outlet>
    <SiDedge/>


 </Outlet>
 
    
    </>
}