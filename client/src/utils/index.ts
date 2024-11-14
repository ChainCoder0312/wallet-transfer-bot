const RenderDate = (datestr: string) => {
  return new Date(datestr).toLocaleDateString();
};

export default RenderDate;