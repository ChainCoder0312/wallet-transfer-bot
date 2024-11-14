import Header from "./header";
import Wallets from "../components/wallets";
import Logs from "../components/logs";
import { Divider } from "@nextui-org/react";

import Tokens from "../components/token";

const Main = () => {
  return (
    <div className=" bg-gray-100 min-h-screen min-w-full  flex-row justify-center" >
      <Header />
      <div className="max-w-[968px] flex-row w-full space-y-8 p-10 justify-self-center bg-white " >
        {/* <h3>Wallets</h3> */}
        <Tokens />
        <br />
        <Wallets />
        <Divider />
        <Logs />

      </div>
    </div>
  );
};

export default Main;