// The one error type every service throws. errorHandler.middleware.js reads
// statusCode off it directly; anything that ISN'T an AppError is treated as an
// unexpected bug (logged, masked as a generic 500) rather than trusted to be safe
// to show the client.
export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
