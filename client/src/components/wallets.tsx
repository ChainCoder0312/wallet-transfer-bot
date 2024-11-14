import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import { FaAddressBook } from "react-icons/fa";
import { IoKeyOutline, IoSettingsOutline } from "react-icons/io5";
import { MdSecurity } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";

const Wallets = () => {


  const [wallet1, setWallet1] = useState({
    publicKey: 'asdflakfakj3i90u23o03ir32ir',
    privateKey: '00000000000000000000'
  });
  const [wallet2, setWallet2] = useState({
    publicKey: 'akjsdfj939u0r83809239u9320r',
    privateKey: '00000000000000000000'
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [current, setCurrent] = useState(1);



  const [passModal, setPassModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const init = () => {
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

  const onCheckPass = () => {
    setPassModal(false);
    setIsChecked(true);
  };
  const onSave = () => {
    console.log(wallet1, wallet2);
    onclose;
  };



  return (
    <div className="max-md:block flex justify-center gap-8" >
      <div className="flex  justify-center items-center whitespace-nowrap "  >
        Wallet 1:&nbsp;{wallet1.publicKey} &nbsp;<Tooltip showArrow={true} color='secondary' content='setting'>
          <div>

            <IoSettingsOutline onClick={() => {
              onOpen();
              setCurrent(1);
            }} className="active:scale-75" />
          </div>
        </Tooltip>
      </div>
      <div className="flex  justify-center items-center whitespace-nowrap "  >
        Wallet 2:&nbsp;{wallet2.publicKey} &nbsp;<Tooltip showArrow={true} color='secondary' content='setting'>
          <div>

            <IoSettingsOutline onClick={() => {
              onOpen();
              setCurrent(2);
            }} className=" active:scale-75" />
          </div>
        </Tooltip>
      </div>
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
                <Button color="primary" onPress={() => {
                  init();
                  onClose();
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