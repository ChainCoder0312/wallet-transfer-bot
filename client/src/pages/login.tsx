import { Button, Input } from "@nextui-org/react";
import { KeyboardEvent, useState } from "react";
import { IoKeyOutline } from "react-icons/io5";
import { postService } from "../utils/request";
import { useAuth } from "../utils/use-auth";
import { saveSession } from "../utils/session";
import toast from "react-hot-toast";

const Login = () => {
  const [password, setPassword] = useState('');
  const { setIsLoggedIn } = useAuth();
  const handleLogin = async () => {
    try {
      if (!password) return;
      const { data } = await postService('/auth/login', { password });
      if (data?.token) {
        setIsLoggedIn(true);
        saveSession(data?.token);
        toast.success(data.message);
      }
    } catch (error: any) {

    }

  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className=" bg-gray-100 min-h-screen min-w-full items-center flex justify-center" >
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md" >
        <div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900" >Sign In</h2>
        </div>
        <div >

          <Input
            endContent={
              <IoKeyOutline className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
            }
            onKeyDown={handleKeydown}
            value={password}
            placeholder="Enter your password"
            label='Password'
            type="password"
            autoFocus
            variant="bordered"
            onChange={e => setPassword(e.target.value)}
          />
          <br />
          <Button size="lg" color="success" className="w-full text-white" onClick={handleLogin}  >Sign in</Button>

        </div>
      </div>
    </div>
  );
};

export default Login;