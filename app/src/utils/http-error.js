export default class HttpError extends Error {
  status;

  /**
   * @param {string} message
   * @param {number} status
   **/
  constructor(message, status) {
    super(message);

    this.status = status;
  }
}
