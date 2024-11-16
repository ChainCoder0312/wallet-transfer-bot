import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useFormik } from "formik";
import { useState } from "react";
import { BsKey, BsLock, BsUnlock } from "react-icons/bs";
import { MdLock, MdLogout } from "react-icons/md";
import * as Yup from 'yup';
import { useStore } from "../utils/use-store";
import { postService } from "../utils/request";
import { deleteSession } from "../utils/session";
import toast from "react-hot-toast";

const Header = () => {
  const [passModal, setPassModal] = useState(false);
  const { setIsLoggedIn } = useStore();

  const handleLogout = async () => {
    const { data } = await postService('/auth/logout', {});
    setIsLoggedIn(false);
    deleteSession();
    toast.success(data.message);

  };


  const validationSchema = Yup.object({
    currentPassword: Yup.string()
      .required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'New password must be at least 8 characters long')
      .required('New password is required')
      .notOneOf([Yup.ref('currentPassword')], 'New password must be different from the current password'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your new password'),
  });


  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      // Handle the password change request (e.g., send to the server)
      const { data } = await postService('/auth/change_password', values);
      toast.success(data.message);
      setPassModal(false);
    },
  });

  const { getFieldProps, handleSubmit, errors, touched } = formik;

  return (
    <div className="w-full h-16  bg-gray-300  py-4- px-20 flex items-center justify-end  gap-6"  >
      <div onClick={() => setPassModal(true)} className="active:scale-75" >
        <MdLock className="  text-2xl text-default-500 pointer-events-none flex-shrink-0" />

      </div>
      <div onClick={handleLogout} className="active:scale-75" >

        <MdLogout className="text-2xl text-default-500 pointer-events-none flex-shrink-0 " />
      </div>
      <Modal
        isOpen={passModal}
        onOpenChange={(val: boolean) => setPassModal(val)}
        placement="top-center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Change Password</ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit}  >


                  <Input
                    endContent={
                      <BsUnlock className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    }
                    placeholder="Enter current password"
                    label='Current Password'
                    type="password"
                    autoFocus
                    variant="bordered"
                    {...getFieldProps('currentPassword')}
                  />
                  {touched.currentPassword && errors.currentPassword ? (
                    <div className="text-red-500 text-sm px-2">{formik.errors.currentPassword}</div>
                  ) : null}
                  <Input
                    endContent={
                      <BsLock className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    }
                    placeholder="Enter new password"
                    label='New Password'
                    type="password"

                    variant="bordered"
                    {...getFieldProps('newPassword')}
                  />
                  {touched.newPassword && errors.newPassword ? (
                    <div className="text-red-500 text-sm px-2">{errors.newPassword}</div>
                  ) : null}
                  <Input
                    endContent={
                      <BsKey className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    }
                    placeholder="Confirm password"
                    label='Confirm Password'
                    type="password"

                    variant="bordered"
                    {...getFieldProps('confirmPassword')}
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                    <div className="text-red-500 text-sm px-2">{formik.errors.confirmPassword}</div>
                  ) : null}

                </form>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={() => setPassModal(false)}>
                  Close
                </Button>
                <Button color="primary" onPress={() => handleSubmit()}>
                  Ok
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div >
  );
};

export default Header;