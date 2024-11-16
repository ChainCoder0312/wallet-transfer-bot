import { Tooltip } from "@nextui-org/react";

const RenderLongString = ({ children, link }: { children: string; link?: string; }) => {
  return (
    <Tooltip isDisabled={children.length <= 15} showArrow={true} color='secondary' content={children}>
      <a href={link + children} onClick={e => {
        if (!link) e.preventDefault();
      }} target="_blank" className={` ${link ? "hover:text-cyan-500 cursor-pointer" : ''}`} >{children.length > 15 ? children.slice(0, 7) + '...' + children.slice(-5) : children}</a>
    </Tooltip>

  );
};

export default RenderLongString;