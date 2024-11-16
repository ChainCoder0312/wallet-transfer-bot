import { useState } from 'react';
import { GrCheckmark } from 'react-icons/gr';
import { IoCopyOutline } from 'react-icons/io5';

const Copybutton = ({ text = '' }: { text?: string; }) => {

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log("Text copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy text: ", error);
      });
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };


  return (
    <div className=' items-center' onClick={handleCopy}  >{copied ? <GrCheckmark className='text-green-500' /> : <IoCopyOutline />}</div>
  );
};

export default Copybutton;