const log = (level: string, message: string) => {
  const time = new Date().toISOString();
  console.log(`[${level}] ${time} - ${message}`);
};

export const logger = {
  info: (msg: string) => log('INFO', msg),
  error: (msg: string) => log('ERROR', msg),
  warn: (msg: string) => log('WARN', msg),
};
