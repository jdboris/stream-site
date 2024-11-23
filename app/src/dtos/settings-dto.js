export default class SettingsDto {
  /**
   * @param {SettingsDto} data
   **/
  constructor(data) {
    /** @type {number} */
    this.id = data.id;
    /** @type {number} */
    this.liveChannelId = data.liveChannelId;
    /** @type {import("@prisma/client").Banner} */
    this.banner = data.banner;
  }
}
