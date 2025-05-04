// import dependencies
import { consoleLogger, fileLogger } from "./consoleLogger.js";

const isProduction = process.env.NODE_ENV === 'production';
const logger = isProduction ? fileLogger() : consoleLogger();

export default logger;