export default class ColumnChart {
  constructor(args) {
    if (typeof args === 'object') {  
      this.data = args.data;
      this.label = args.label;
      this.link = args.link;
      this.value = args.value;  
      this.formatHeading = args.formatHeading;
    }
    this.chartHeight = 50;
    this.render();
    this.initEventListeners();
  }

  render() {
    const element = document.createElement('div'); // (*)

    let max; 
    let scale; 
    if (this.data) {
      max = this.data.reduce((acc, val) => val > acc ? val : acc, 0);
      if (max === 0) {
        scale = 1;
      } else {
        scale = this.data && max / this.chartHeight;
      }
    }
    
    element.innerHTML = `
        <div class="column-chart ${this.data && this.data.length ? '' : 'column-chart_loading'}" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
                ${this.label}
                <a class="column-chart__link" href="#">View all</a>
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                    ${this.formatHeading ? this.formatHeading(this.value) : this.value}
                </div>
            <div data-element="body" class="column-chart__chart">
                ${this.data ? this.data.map(item => `<div style="--value: ${Math.floor(item / scale)}"  data-tooltip="${Math.round(item * 100 / max)}%"></div>`).join('') : ''}
            </div>
            </div>
        </div>
        `;
    
    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;
  }
    
  initEventListeners () {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  update (data) {
    this.data = data;
    this.render();
  }
    
  remove () {
    this.element.remove();
  }
    
  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}