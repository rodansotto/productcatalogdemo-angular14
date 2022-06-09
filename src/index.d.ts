export {};

declare global {
  interface Window {
    initSqlJs: any;
    db: any;
  }
}