import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Image from "next/image";

const Login: NextPage = () => {
  return (
    <div className="flex bg-infobg h-screen bg-no-repeat bg-cover bg-center">
      <a className="bg-white h-96 w-2/6 block mx-auto my-auto rounded-3xl">
        <div className="m-5">
          <p className="font-bold text-xl "> Lets get started </p>
		  <p className="text-sm -mt-1 text-gray-400 "> To configure your Tovy instance, we'll need some infomation </p>

		  <div className="mt-2"> <label htmlFor="groupid" className="text-gray-500 text-sm">helo </label> <input placeholder="dog" id="groupid" className="text-gray-600 rounded-lg p-2 border-2 border-grey-300 w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"/> </div>
		  <div className="mt-7"> <label htmlFor="groupid" className="text-gray-500 text-sm">Color </label> <input placeholder="dog" id="groupid" className="text-gray-600 rounded-lg p-2 border-2 border-grey-300 w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"/> </div>

        </div>
      </a>
    </div>
  );
};

export default Login;
