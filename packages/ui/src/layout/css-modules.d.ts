// CSS Modules: the class map a `*.module.css` import returns.
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
