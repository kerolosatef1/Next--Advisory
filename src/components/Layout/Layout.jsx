import React, { useEffect, useState } from "react";
import Style from "./Layout.module.css";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./../Navbar/Navbar";
import Footer from "./../Footer/Footer";
import { SiDedge } from "react-icons/si";
import { slider } from "@material-tailwind/react";

export default function Layout() {
  const location = useLocation();

  // قائمة المسارات التي تريد إخفاء النافبار والفوتر فيها
  const hideNavbarAndFooter = [
    "/login",
    "/",
    "/register",
    "/resetpassword",
    "/forgetpassword",
    "/proffesors",
    "/teachingassistant",
    "/courses",
    "/halls",
    "*", // هذا سيغطي جميع المسارات غير المطابقة بما فيها صفحة Not Found
  ];

  const shouldHide =
    hideNavbarAndFooter.includes(location.pathname.toLowerCase()) ||
    hideNavbarAndFooter.includes("*");

  useEffect(() => {}, []);

  return (
    <>
      {!shouldHide && <Navbar />}
      <Outlet>
        <SiDedge />
      </Outlet>
      {!shouldHide && <Footer />}
    </>
  );
}
