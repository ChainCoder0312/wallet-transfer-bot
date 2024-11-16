const RenderDate = (datestr: string) => {
  return new Date(datestr).toLocaleDateString();
};

export default RenderDate;

export function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}