import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { IoCartOutline } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi";

function Header() {
    return (
        <header className="header">
            <div className="header-inner">
                <div className="logo-wrapper">
                    <img src={logo} alt="logo"></img>
                </div>

                <nav id="main-nav">
                    <ul>
                        <li><a href="#">Kiełbasy</a></li>
                        <li><a href="#">Wędliny</a></li>
                        <li><a href="#">Wyroby podrobowe</a></li>
                        <li><a href="#">Nasze paczki</a></li>
                        <li><a href="#">Kontakt</a></li>
                    </ul>
                </nav>

                <div className="account-icons"></div>

            </div>
        </header>
    );
}

export default Header;