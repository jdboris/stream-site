export default class ChannelDto {
  /**
   * @param {ChannelDto} data
   **/
  constructor(data) {
    /** @type {number} */
    this.id = data.id;
    /** @type {string} */
    this.service = data.service;
    /** @type {string} */
    this.description = data.description;
    /** @type {string} */
    this.name = data.name;
    /** @type {string} */
    this.source = data.source;
    /** @type {boolean} */
    this.isSecure = data.isSecure;
  }
}
