import type { NextPage, GetStaticProps } from "next";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import Image from "next/image";

const Login: NextPage = () => {
  const colors = [
    "[#2196f3]",
    "blue-500",
    "red-5",
    "green",
    "yellow",
    "orange",
    "purple",
    "pink",
    "black",
    "white",
    "gray",
  ];
  return (
    <div className="flex bg-infobg h-screen bg-no-repeat bg-cover bg-center ">
      <p className="text-md -mt-1 text-white absolute top-4 left-4 xs:hidden md:text-6xl font-extrabold">
        Welcome <br /> to <span className="text-[#2196f3] "> Tovy </span>
      </p>
      <a className="bg-white h-96 w-11/12 sm:w-4/6 md:3/6 xl:w-5/12 block mx-auto my-auto rounded-3xl">
        <div className="m-6">
          <p className="font-bold text-2xl "> Lets get started </p>
          <p className="text-md -mt-1 text-gray-500 ">
            To configure your Tovy instance, we'll need some infomation
          </p>

          <div className="mt-2">
            <label htmlFor="groupid" className="text-gray-500 text-sm">
              helo
            </label>
            <input
              placeholder="dog"
              id="groupid"
              className="text-gray-600 rounded-lg p-2 border-2 border-grey-300 w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="mt-7">
            <label className="text-gray-500 text-sm">Color </label>
            <div className="grid grid-cols-12">
              {colors.map((color, i) => (
                <a
                  key={i}
                  className={`h-10 w-10 block rounded-full bg-${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default Login;
