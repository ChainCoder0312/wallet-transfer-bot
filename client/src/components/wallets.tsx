import { Button, Card, CardBody, CardHeader, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Tooltip, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FaAddressBook } from "react-icons/fa";
import { IoKeyOutline, IoSettingsOutline } from "react-icons/io5";
import { MdSecurity } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";
import Copybutton from "./copybutton";
import { useStore } from "../utils/use-store";
import { getService, postService } from "../utils/request";
import toast from "react-hot-toast";
import { useEther } from "../utils/use-ether";
import { isValidAddress } from "../utils";
import { ethers } from "ethers";
import { useSocket } from "../utils/use-socket";


interface Wallet {
  publicKey: string;
  privateKey: string;
}

const Wallets = () => {
  const { getContractInfo, provider } = useEther();
  const { socket } = useSocket();
  const { tokens } = useStore();


  const [wallet1, setWallet1] = useState<Wallet>({
    publicKey: '',
    privateKey: '00000000000000000000'
  });
  const [wallet2, setWallet2] = useState<Wallet>({
    publicKey: '',
    privateKey: '00000000000000000000'
  });
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const [current, setCurrent] = useState(1);
  const [sending, setSending] = useState(false);

  const [passModal, setPassModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const [selectedTokens, setSelectedTokens] = useState<string[]>(['', '']);
  const [balances, setBalances] = useState<string[]>(['0', '0']);

  const getBalance = async (num: 0 | 1) => {
    const wallet = num ? wallet2 : wallet1;
    let balance: string;
    const token = tokens.filter(tk => tk.symbol === selectedTokens[num])[0];
    if (token?.isNative) {
      if (!isValidAddress(wallet.publicKey)) return;
      balance = ethers.formatEther(await provider?.getBalance(wallet.publicKey) || 0);
      // setBalances((prev) => {
      //   prev[num] = balance;
      //   return [...prev];
      // });
    } else {
      const res = await getContractInfo(token?.contract, wallet.publicKey, token?.decimal || 18);
      balance = res?.balance || '0';
      // setBalances((prev) => {
      //   prev[num] = balance;
      //   return [...prev];
      // });
    }
    return balance;
  };

  const updateBlance = async () => {
    console.log('===========>updatebalance');
    const balance1: string = (await getBalance(0)) || '';
    const balance2: string = (await getBalance(1)) || "";
    console.log(balance1, balance2);
    setBalances([balance1, balance2]);
  };

  useEffect(() => {
    updateBlance();
  }, [selectedTokens, wallet1.publicKey, wallet2.publicKey]);

  useEffect(() => {
    if (socket) {
      socket.on('update_balance', () => {
        updateBlance();
      });
      return () => {
        socket.off('update_balance');
      };
    }
  }, [socket, tokens, wallet1.publicKey, wallet2.publicKey, balances]);

  useEffect(() => {
    getService('/wallet/fetch').then((res: any) => {
      setWallet1({ ...wallet1, publicKey: res.data[0]?.publicKey || '' });
      setWallet2({ ...wallet2, publicKey: res.data[1]?.publicKey || '' });
    }).catch(err => console.log(err));
  }, []);


  const init = () => {
    setSending(false);
    setPassword('');
    setIsChecked(false);
    setWallet1(prev => ({ ...prev, privateKey: '00000000000000000000' }));
    setWallet2(prev => ({ ...prev, privateKey: '00000000000000000000' }));
  };

  function onchange(key: 'private' | 'public', value: string) {
    if (current === 1) {
      if (key === 'private') {
        if (isChecked)
          setWallet1(prev => ({ ...prev, privateKey: value }));
      }
      else setWallet1(prev => ({ ...prev, publicKey: value }));
    } else {
      if (key === 'private') {
        if (isChecked)
          setWallet2(prev => ({ ...prev, privateKey: value }));
      }
      else setWallet2(prev => ({ ...prev, publicKey: value }));
    }

  }

  const onCheckPass = async () => {
    const { data } = await postService('/wallet/privateKey', { password, num: current });
    if (current === 1) {
      setWallet1(prev => ({ ...prev, privateKey: data }));
    } else {
      setWallet2(prev => ({ ...prev, privateKey: data }));
    }
    setIsChecked(true);
    setPassModal(false);
  };
  const onSave = async () => {
    let wallet = (current === 1 ? wallet1 : wallet2);
    let dataToSend;
    if (!isChecked) dataToSend = { publicKey: wallet.publicKey } as Wallet;
    else dataToSend = wallet as Wallet;
    setSending(true);
    const { data } = await postService('/wallet/save', { wallet: dataToSend, num: current });
    toast.success(data.message);

    init();
    onClose();
  };

  const onSelect = (value: string, num: 1 | 2) => {
    selectedTokens[num - 1] = value;
    setSelectedTokens([...selectedTokens]);
  };





  return (
    <div className="max-md:block flex justify-center gap-8" >
      <Card className="p-4 max-md:my-4 md:w-1/2 ">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">

          <h4 className="font-bold w-full text-center text-large">Wallet 1 <Tooltip showArrow={true} color='secondary' content='setting'>
            <div className=" absolute top-6 right-6" >

              <IoSettingsOutline onClick={() => {
                onOpen();
                setCurrent(1);
              }} className="active:scale-75 float-end" />
            </div>
          </Tooltip></h4>
        </CardHeader>
        <CardBody className="overflow-visible  py-2">
          {wallet1.publicKey && <div className="flex  items-center justify-center" >
            {wallet1.publicKey}&nbsp;<Copybutton text={wallet1.publicKey} />
          </div>}
          <br />
          <div className="w-full  block sm:flex md:block lg:flex justify-between" >
            <div className=" w-full sm:w-1/2 md:w-full lg:w-1/2" >
              <Select
                onChange={(e: any) => onSelect(e.target.value, 1)}
                items={tokens}
                label="Token"
                className=""
                placeholder="Select a token"
                variant="bordered"
                classNames={{
                  label: "group-data-[filled=true]:-translate-y-5",
                  trigger: "min-h-16",
                  listboxWrapper: "max-h-[400px]",
                }}
                listboxProps={{
                  itemClasses: {
                    base: [
                      "rounded-md",
                      "text-default-500",
                      "transition-opacity",
                      "data-[hover=true]:text-foreground",
                      "data-[hover=true]:bg-default-100",
                      "dark:data-[hover=true]:bg-default-50",
                      "data-[selectable=true]:focus:bg-default-50",
                      "data-[pressed=true]:opacity-70",
                      "data-[focus-visible=true]:ring-default-500",
                    ],
                  },
                }}
                popoverProps={{
                  classNames: {
                    base: "before:bg-default-200",
                    content: "p-0 border-small border-divider bg-background",
                  },
                }}
                renderValue={(items) => {
                  return items.map((item) => (
                    <div key={item.key} className="flex items-center gap-2">

                      {item.data?.icon ? <img src={item.data?.icon} className="w-8 h-8 rounded-full" /> : <div className=" rounded-full  flex justify-center items-center w-8 h-8 bg-gray-500 text-white " > {item.data?.symbol[0]}  </div>}
                      <div className="flex flex-col">
                        <span>{item.data?.symbol}</span>
                        <span className="text-default-500 text-tiny">({item.data?.name})</span>
                      </div>
                    </div>
                  ));
                }}
              >
                {(token) => (
                  <SelectItem key={token.symbol} textValue={token.name}>
                    <div className="flex gap-2 items-center">
                      {token?.icon ? <img src={token.icon} className="w-8 h-8 rounded-full" /> : <div className=" rounded-full  flex justify-center items-center w-8 h-8 bg-gray-500 text-white " > {token.symbol[0]}  </div>}
                      <div className="flex flex-col">
                        <span className="text-small">{token.symbol}</span>
                        <span className="text-tiny text-default-400">{token.name}</span>
                      </div>
                    </div>
                  </SelectItem>
                )}
              </Select>
            </div>

            <div className="px-4 py-2 text-xl  text-right"  >
              <div>

                {balances[0]}
              </div>
              <div className=" text-sm text-gray-600" >
                {
                  selectedTokens[0]
                }
              </div>
            </div>
          </div>


        </CardBody>
      </Card>
      <Card className="p-4 max-md:my-4 md:w-1/2 ">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">

          <h4 className="font-bold w-full text-center text-large">Wallet 2 <Tooltip showArrow={true} color='secondary' content='setting'>
            <div className=" absolute top-6 right-6" >

              <IoSettingsOutline onClick={() => {
                onOpen();
                setCurrent(2);
              }} className="active:scale-75 float-end" />
            </div>
          </Tooltip></h4>
        </CardHeader>
        <CardBody className="overflow-visible   py-2">
          {wallet2.publicKey && <div className="flex  items-center justify-center" >
            {wallet2.publicKey}&nbsp;<Copybutton text={wallet2.publicKey} />

          </div>}
          <br />
          <div className="w-full  block sm:flex md:block lg:flex justify-between" >

            <div className=" w-full sm:w-1/2 md:w-full lg:w-1/2   " >
              <Select
                onChange={(e: any) => onSelect(e.target.value, 2)}
                items={tokens}
                label="Token"
                className=""
                placeholder="Select a token"
                variant="bordered"
                classNames={{
                  label: "group-data-[filled=true]:-translate-y-5",
                  trigger: "min-h-16",
                  listboxWrapper: "max-h-[400px]",
                }}
                listboxProps={{
                  itemClasses: {
                    base: [
                      "rounded-md",
                      "text-default-500",
                      "transition-opacity",
                      "data-[hover=true]:text-foreground",
                      "data-[hover=true]:bg-default-100",
                      "dark:data-[hover=true]:bg-default-50",
                      "data-[selectable=true]:focus:bg-default-50",
                      "data-[pressed=true]:opacity-70",
                      "data-[focus-visible=true]:ring-default-500",
                    ],
                  },
                }}
                popoverProps={{
                  classNames: {
                    base: "before:bg-default-200",
                    content: "p-0 border-small border-divider bg-background",
                  },
                }}
                renderValue={(items) => {
                  return items.map((item) => (
                    <div key={item.key} className="flex items-center gap-2">

                      {item.data?.icon ? <img src={item.data?.icon} className="w-8 h-8 rounded-full" /> : <div className=" rounded-full  flex justify-center items-center w-8 h-8 bg-gray-500 text-white " > {item.data?.symbol[0]}  </div>}
                      <div className="flex flex-col">
                        <span>{item.data?.symbol}</span>
                        <span className="text-default-500 text-tiny">({item.data?.name})</span>
                      </div>
                    </div>
                  ));
                }}
              >
                {(token) => (
                  <SelectItem key={token.symbol} textValue={token.name}>
                    <div className="flex gap-2 items-center">
                      {token?.icon ? <img src={token.icon} className="w-8 h-8 rounded-full" /> : <div className=" rounded-full  flex justify-center items-center w-8 h-8 bg-gray-500 text-white " > {token.symbol[0]}  </div>}
                      <div className="flex flex-col">
                        <span className="text-small">{token.symbol}</span>
                        <span className="text-tiny text-default-400">{token.name}</span>
                      </div>
                    </div>
                  </SelectItem>
                )}
              </Select>
            </div>
            <div className="px-4 py-2 text-xl block  text-right"  >
              <div>

                {balances[1]}
              </div>
              <div className=" text-sm text-gray-600" >
                {
                  selectedTokens[1]
                }
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={isOpen}
        onOpenChange={(val: boolean) => {
          onOpenChange();
          if (!val) init();
        }}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Address Setting</ModalHeader>
              <ModalBody>
                Public Key
                <Input
                  autoFocus
                  endContent={
                    <FaAddressBook className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  value={current == 1 ? wallet1.publicKey : wallet2.publicKey}
                  placeholder="Enter your public key"
                  variant="bordered"
                  onChange={(e) => onchange('public', e.target.value)}
                />
                Private Key
                <div className=" flex " >

                  <Input
                    // onFocus={() => setPassModal(true)}
                    endContent={
                      <MdSecurity className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    }
                    value={current == 1 ? wallet1.privateKey : wallet2.privateKey}
                    placeholder="Enter your private key"
                    type={isChecked ? 'text' : 'password'}
                    variant="bordered"
                    classNames={{
                      inputWrapper: 'rounded-r-none'
                    }}
                    onChange={(e) => onchange('private', e.target.value)}
                  />
                  <Button onClick={() => setPassModal(true)} isIconOnly variant="bordered" className="rounded-l-none border-l-0"><RiEditLine /></Button>
                </div>

              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => {
                  init();
                  onClose();

                }}>
                  Close
                </Button>
                <Button color="primary" isLoading={sending} onPress={() => {

                  onSave();
                }}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={passModal}
        onOpenChange={(val: boolean) => setPassModal(val)}
        placement="top-center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Input password to edit private key</ModalHeader>
              <ModalBody>

                <Input
                  endContent={
                    <IoKeyOutline className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  value={password}
                  placeholder="Enter your password"
                  label='Password'
                  type="password"
                  autoFocus
                  variant="bordered"
                  onChange={e => setPassword(e.target.value)}
                />

              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => setPassModal(false)}>
                  Close
                </Button>
                <Button color="primary" onPress={onCheckPass}>
                  Ok
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Wallets;