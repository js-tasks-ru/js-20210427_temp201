import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {  
  constructor({label = '', link = '#', url, range, formatHeading} = {}) {
    this.data = {};
    this.label = label;
    this.link = link;
    this.range = range;
    this.url = url;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;
    this.render();
    if (this.range) {
      this.update(this.range.from, this.range.to);
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async loadData () {
    this.setLoading(true);
    try {
      await fetchJson(`${BACKEND_URL}/${this.url}?from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`)
        .then(json => this.data = json);
      if (Object.values(this.data).length) {  
        this.setLoading(false);
      }
      this.subElements.body.innerHTML = this.renderData();
      this.subElements.header.innerHTML = this.renderHeader();
    }
    catch (err) {
    //   this.setLoading(false);
    //   console.log(err);
    }
  }

  setLoading(val) {
    if (val) {
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
    }
  }

  renderHeader() {
    this.value = Object.values(this.data).reduce((acc, val) => acc + val, 0);
    return this.formatHeading ? this.formatHeading(this.value) : this.value;
  }

  renderData() {
    let max; 
    let scale; 
    if (this.data) {
      max = Object.values(this.data).reduce((acc, val) => val > acc ? val : acc, 0);
      if (max === 0) {
        scale = 1;
      } else {
        scale = this.data && max / this.chartHeight;
      }
    }

    return Object.values(this.data).map(item => `<div style="--value: ${Math.floor(item / scale)}"  data-tooltip="${Math.round(item * 100 / max)}%"></div>`).join('');
  }
  
  render() {
    const element = document.createElement('div');
      
    element.innerHTML = `
          <div class="column-chart" style="--chart-height: ${this.chartHeight}">
              <div class="column-chart__title">
                  ${this.label}
                  <a class="column-chart__link" href="#">View all</a>
              </div>
              <div class="column-chart__container">
                  <div data-element="header" class="column-chart__header">
                      ${this.renderHeader()}
                  </div>
              <div data-element="body" class="column-chart__chart">
                  ${this.renderData()}
              </div>
              </div>
          </div>
          `;
      
    this.element = element.firstElementChild;

    this.element.classList.add('column-chart_loading');

    this.subElements = this.getSubElements(this.element);
  }
  
  async update (from, to) {
    this.range = {from, to};
    await this.loadData();
    return this.data;
  }
      
  remove () {
    if (this.element) {  
      this.element.remove();
      this.element = null;
    }
    this.subElements = null;
    
  }
      
  destroy() {
    this.remove();
  }
}
  
  
