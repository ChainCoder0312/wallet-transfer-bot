import { useEffect, useState } from 'react';
import { Modal, Button, Input, Image, ModalContent } from "@nextui-org/react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TiPlusOutline } from 'react-icons/ti';
import { postService } from '../utils/request';
import toast from 'react-hot-toast';
import { useStore } from '../utils/use-store';
import { useEther } from '../utils/use-ether';

const TokenSchema = Yup.object().shape({
  name: Yup.string().required('Token name is required'),
  contract: Yup.string().required('Contract address is required'),
  icon: Yup.string().url('Must be a valid URL').nullable(),
  decimal: Yup.number().nullable(),
  symbol: Yup.string().required('Token symbol is required')
});

interface TokenFormValues {
  name: string;
  contract: string;
  icon: string;
  decimal: number;
  symbol: string;
}

export default function AddTokenModal() {
  const { getContractInfo } = useEther();

  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { setTokens, tokens } = useStore();

  const initialValues: TokenFormValues = {
    name: '',
    contract: '',
    icon: '',
    decimal: 0,
    symbol: ''
  };
  const formik = useFormik({
    initialValues,
    validationSchema: TokenSchema,
    onSubmit: async (values: TokenFormValues, { resetForm }: { resetForm: () => void; }) => {
      try {
        setIsSending(true);
        const { data } = await postService('/token/add', values);
        setTokens([...tokens, values]);
        toast.success(data.message);
        resetForm();
        setPreviewUrl('');
        handleClose();
        setIsSending(false);
      } catch (err) {
        setIsSending(false);
      }
    },
  });


  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setPreviewUrl('');
  };

  const { getFieldProps, handleSubmit, errors, touched, values, setFieldValue } = formik;

  useEffect(() => {

    getContractInfo(values.contract).then(res => {

      setFieldValue('name', res?.name || '');
      setFieldValue('decimal', res?.decimal || '');
      setFieldValue('symbol', res?.symbol || "");

    }).catch(err => console.log(err));
  }, [values.contract]);


  return (
    <>
      <Button onClick={handleOpen} size='sm' color='secondary' className=' float-end '>
        <TiPlusOutline /> Import Token
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg"
      >
        <ModalContent>

          <form
            onSubmit={handleSubmit}
          >
            <div className=' flex items-baseline' >

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import Token</h2>&nbsp;&nbsp;&nbsp;
              <h6>(Binance Smart Chain)</h6>
            </div>
            <br />
            <div>
              <Input
                autoFocus
                {...getFieldProps('contract')}
                label="Contract Address"
                placeholder="Enter contract address"
                className="w-full"
                variant='bordered'

              />
              <div className='text-sm text-red-400 px-2 h-8'>

                {touched.contract && errors.contract}
              </div>
            </div>

            <div>
              <Input
                {...getFieldProps('name')}

                label="Token Name"
                placeholder="Enter token name"
                className="w-full"
                variant='bordered'

              />
              <div className='text-sm text-red-400 px-2 h-8'>
                {touched.name && errors.name}
              </div>
            </div>

            <div>
              <Input
                {...getFieldProps('symbol')}
                // isDisabled
                onChange={() => { }}

                label="Token Symbol"
                placeholder="Enter token symbol"
                className="w-full"
                variant='bordered'
              />
              <div className='text-sm text-red-400 px-2 h-8'>
                {touched.symbol && errors.symbol}
              </div>
            </div>


            <div>
              <Input
                {...getFieldProps('decimal')}
                label="Decimal"
                onChange={() => { }}

                placeholder="Enter token decimal"
                className="w-full"
                variant='bordered'
              />
              <div className='text-sm text-red-400 px-2 h-8'>
                {touched.decimal && errors.decimal}
              </div>
            </div>

            <div>
              <Input
                {...getFieldProps('icon')}
                label="Icon URL"
                placeholder="Enter icon URL"
                className="w-full"
                variant='bordered'

                onChange={(e) => {
                  getFieldProps('icon').onChange(e);
                  setPreviewUrl(e.target.value);
                }}
              />
              <div className='text-sm text-red-400 px-2 h-8'>

                {touched.icon && errors.icon}
              </div>
            </div>

            {values.icon && (
              <div className="flex items-center justify-center space-x-4 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Icon Preview:</p>
                <Image
                  src={previewUrl}
                  alt="Token Icon Preview"
                  className="w-12 h-12 object-contain bg-gray-100 dark:bg-gray-700 rounded-full"

                />
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button color="danger" variant="flat" onClick={handleClose}>
                Cancel
              </Button>
              <Button isDisabled={!values.name} isLoading={isSending} type="submit" color="primary">
                Import
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}