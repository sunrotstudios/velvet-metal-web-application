interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
}

function formatLogMessage(message: string, args: any[]): string {
  if (args.length === 0) return message;
  try {
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return '\n' + JSON.stringify(arg, null, 2);
      }
      return JSON.stringify(arg);
    }).join(' ');
    return `${message}${formattedArgs}`;
  } catch (e) {
    return message;
  }
}

const logger: Logger = {
  info: (message: string, ...args: any[]) => {
    const formattedMessage = formatLogMessage(message, args);
    console.log(`[INFO] ${formattedMessage}`);
  },
  error: (message: string, ...args: any[]) => {
    const formattedMessage = formatLogMessage(message, args);
    console.error(`[ERROR] ${formattedMessage}`);
  },
  warn: (message: string, ...args: any[]) => {
    const formattedMessage = formatLogMessage(message, args);
    console.warn(`[WARN] ${formattedMessage}`);
  }
};

export default logger;