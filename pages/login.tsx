import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Image from "next/image";

const Login: NextPage = () => {
  return (
    <div className="flex bg-infobg h-screen bg-no-repeat bg-cover bg-center">
      <a className="bg-white h-96 w-2/6 block mx-auto my-auto rounded-md">
        <div className="m-4">
          <p className="font-bold text-xl "> Lets get started </p>
		  <p className="text-sm -mt-1 text-gray-400 "> To configure your Tovy instance, we'll need some infomation </p>

		  <div className="mt-2"> <input placeholder="dog" className=" border-grey-300 p-2 border-2 rounded w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:ring-4"/> </div>
		  
        </div>
      </a>
    </div>
  );
};

export default Login;
