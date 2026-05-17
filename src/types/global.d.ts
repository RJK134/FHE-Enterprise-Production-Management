// Module declarations for side-effect imports (CSS / asset modules) so the
// stricter TypeScript 6 type-checker accepts them in App Router pages.
declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
