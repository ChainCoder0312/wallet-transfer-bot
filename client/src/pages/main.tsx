import Header from "./header";
import Wallets from "../components/wallets";
import Logs from "../components/logs";
import { Button, Divider } from "@nextui-org/react";

import Tokens from "../components/token";
import { useEffect, useState } from "react";
import { useSocket } from "../utils/use-socket";
enum serverStatus { RUNNING, STOPPED };

const Main = () => {
  const { socket } = useSocket();
  const [isRunning, setRunning] = useState<boolean>(false);
  const handleServer = () => {
    if (socket) {
      socket.emit(isRunning ? "stop" : "start");
    }
  };


  useEffect(() => {
    if (socket) {
      socket.on("status", (data) => {
        setRunning(data === serverStatus.RUNNING);
      });

      return () => {
        socket.off("status");
      };
    }
  }, [socket]);
  return (
    <div className=" bg-gray-100 min-h-screen min-w-full  flex-row justify-center" >
      <Header />
      <div className="max-w-[968px] flex-row w-full space-y-8 p-10 justify-self-center bg-white " >
        {/* <h3>Wallets</h3> */}
        <div className=' flex justify-end gap-4' >

          <Button onClick={handleServer} size='sm' className="w-28 " color='secondary' >
            <div className={`w-3 h-3 rounded-full   ${isRunning ? 'bg-green-500' : ' bg-red-500'}  `} /> {isRunning ? "Stop" : "Start"}
          </Button>

          <Tokens />
        </div>
        <br />
        <Wallets />
        <Divider />
        <Logs />

      </div>
    </div >
  );
};

export default Main;