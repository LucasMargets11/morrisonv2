const isProduction = import.meta.env.PROD;

export const logger = {
  debug: (...args: any[]) => {
    if (!isProduction) {
      console.debug(...args);
    }
  },
  info: (...args: any[]) => {
    if (!isProduction) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // We allow errors in production to track issues
    console.error(...args);
  },
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  }
};
