import Header from "./header";
import Wallets from "../components/wallets";
import Logs from "../components/logs";
import { Button, Divider, Input } from "@nextui-org/react";

import Tokens from "../components/token";
import { useEffect, useState } from "react";
import { useSocket } from "../utils/use-socket";
enum serverStatus { RUNNING, STOPPED };

const Main = () => {
  const { socket } = useSocket();
  const [isRunning, setRunning] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<string>('0.001');
  const [isEditing, setChangeThresHold] = useState<boolean>(false);

  const handleServer = () => {
    if (socket) {
      socket.emit(isRunning ? "stop" : "start");
    }
  };

  const handleThreshold = () => {
    if (!isEditing) {
      setChangeThresHold(true);
    } else {
      socket?.emit("threshold", threshold);
      setChangeThresHold(false);
    }
  }


  useEffect(() => {
    if (socket) {
      socket.on("status", (data) => {
        setRunning(data === serverStatus.RUNNING);
      });
      socket.on("threshold", (data) => {
        setThreshold(data);
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
        <div className=' flex justify-between gap-4' >
          <div className="flex">
            <Input disabled={!isEditing} value={threshold} type="number" classNames={{ inputWrapper: `${isEditing ? "bg-gray-400 " : "bg-white"} border-[1px]` }} size="sm" min={0} step={0.001} onChange={(e) => {
              setThreshold(e.target.value);
            }} />
            <Button onClick={handleThreshold} size='sm' className="w-32 " color='secondary' >
              {isEditing ? "Save (Threshold)" : "Edit (Threshold)"}
            </Button>
          </div>
          <>
            <Button onClick={handleServer} size='sm' className="w-28 " color='secondary' >
              <div className={`w-3 h-3 rounded-full   ${isRunning ? 'bg-green-500' : ' bg-red-500'}  `} /> {isRunning ? "Stop" : "Start"}
            </Button>

            <Tokens />
          </>
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