export const logger = {
  info: (component: string, message: string, data?: any) => {
    console.log(
      `[${new Date().toISOString()}] [INFO] [${component}] ${message}`,
      data ? data : ''
    );
  },
  error: (component: string, message: string, error?: any) => {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [${component}] ${message}`,
      error ? error : ''
    );
  },
  warn: (component: string, message: string, data?: any) => {
    console.warn(
      `[${new Date().toISOString()}] [WARN] [${component}] ${message}`,
      data ? data : ''
    );
  },
  debug: (component: string, message: string, data?: any) => {
    console.debug(
      `[${new Date().toISOString()}] [DEBUG] [${component}] ${message}`,
      data ? data : ''
    );
  },
};
