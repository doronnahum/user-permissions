declare module 'sift' {
  function sift(query: {}, options?: {}): (value: any) => any;
  export default sift;
}
