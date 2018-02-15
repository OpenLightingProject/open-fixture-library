import manufacturers from '../../fixtures/manufacturers.json';

export default class Manufacturer {
  constructor(man) {
    this.key = man;
  }

  get name() {
    return manufacturers[this.key].name;
  }

  get comment() {
    return manufacturers[this.key].comment || ``;
  }

  get hasComment() {
    return `comment` in manufacturers[this.key];
  }

  get website() {
    return manufacturers[this.key].website || null;
  }

  get rdmId() {
    return manufacturers[this.key].rdmId || null;
  }
}
