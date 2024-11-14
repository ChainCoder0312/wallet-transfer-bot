import { useState } from 'react';
import { Modal, Button, Input, Image, ModalContent } from "@nextui-org/react";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TiPlusOutline } from 'react-icons/ti';
import { postService } from '../utils/request';
import toast from 'react-hot-toast';

const TokenSchema = Yup.object().shape({
  name: Yup.string().required('Token name is required'),
  contract: Yup.string().required('Contract address is required'),
  icon: Yup.string().url('Must be a valid URL').nullable(),
});

interface TokenFormValues {
  name: string;
  contract: string;
  icon: string;
}

export default function AddTokenModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const initialValues: TokenFormValues = {
    name: '',
    contract: '',
    icon: '',
  };

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setPreviewUrl('');
  };

  const handleSubmit = async (values: TokenFormValues, { resetForm }: { resetForm: () => void; }) => {
    try {
      setIsSending(true);
      const { data } = await postService('/token/add', values);
      toast.success(data.message);
      resetForm();
      setPreviewUrl('');
      handleClose();
      setIsSending(false);
    } catch (err) {
      setIsSending(false);
    }

  };

  return (
    <>
      <Button onClick={handleOpen} size='sm' color='secondary' className=' float-end '>
        <TiPlusOutline /> Add Token
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg"
      >
        <ModalContent>

          <Formik
            initialValues={initialValues}
            validationSchema={TokenSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Token</h2>

                <div>
                  <Field name="name">
                    {({ field }: { field: any; }) => (
                      <Input
                        {...field}
                        autoFocus
                        label="Token Name"
                        placeholder="Enter token name"
                        className="w-full"
                        errorMessage={touched.name && errors.name}
                        variant='bordered'
                      />
                    )}
                  </Field>
                  <div className='text-sm text-red-400 px-2'>

                    {touched.name && errors.name}
                  </div>
                </div>

                <div>
                  <Field name="contract">
                    {({ field }: { field: any; }) => (
                      <Input
                        {...field}
                        label="Contract Address"
                        placeholder="Enter contract address"
                        className="w-full"
                        variant='bordered'

                      />
                    )}
                  </Field>
                  <div className='text-sm text-red-400 px-2'>

                    {touched.contract && errors.contract}
                  </div>
                </div>

                <div>
                  <Field name="icon">
                    {({ field }: { field: any; }) => (
                      <Input
                        {...field}
                        label="Icon URL"
                        placeholder="Enter icon URL"
                        className="w-full"
                        variant='bordered'

                        onChange={(e) => {
                          setFieldValue('icon', e.target.value);
                          setPreviewUrl(e.target.value);
                        }}
                      />
                    )}
                  </Field>
                  <div className='text-sm text-red-400 px-2'>

                    {touched.icon && errors.icon}
                  </div>
                </div>

                {values.icon && (
                  <div className="flex items-center justify-center space-x-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Icon Preview:</p>
                    <Image
                      src={previewUrl}
                      alt="Token Icon Preview"
                      className="w-12 h-12 object-contain bg-gray-100 dark:bg-gray-700 rounded-full"
                    /* fallback={<div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500">No Image</div>} */
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button color="danger" variant="flat" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button isLoading={isSending} type="submit" color="primary">
                    Add Token
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </>
  );
}