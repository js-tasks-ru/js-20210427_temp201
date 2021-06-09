import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

    handleChangePeriod = (event) => {
      this.fromDate = event.detail.from; 
      this.toDate = event.detail.to;
      this.components.forEach(component => {
        if (component['loadData']) {
          component.loadData(this.fromDate, this.toDate); 
        }
      });
    };

    constructor () {
      this.components = [];  
      this.toDate = new Date();
      this.fromDate = new Date();
      this.fromDate.setMonth(this.fromDate.getMonth() - 1);
    //   this.render();
    }

    async render () {
      const element = document.createElement('div');
      element.innerHTML = `
    <div class="dashboard full-height flex-column">
      <div class="content__top-panel" data-element="rangePicker">
        <h2 class="page-title">Панель управления</h2>
      </div>  
      <div class="dashboard__charts">
        <div class="dashboard__chart_orders"  data-element="ordersChart"></div>
        <div class="dashboard__chart_sales"  data-element="salesChart"></div>
        <div class="dashboard__chart_customers"  data-element="customersChart"></div>
      </div>
      <h3 class="block-title">Лидеры продаж</h3>
      <div data-element="sortableTable"></div>
    </div>`;

      this.element = element.firstElementChild;

      this.subElements = this.getSubElements(this.element);

      const rangePicker = new RangePicker({from: this.fromDate, to: this.toDate});

      this.subElements.rangePicker.append(rangePicker.element);
      this.components.push(rangePicker);

      const ordersChart = new ColumnChart({
        url: 'api/dashboard/orders',
        range: {
          from: this.fromDate,
          to: this.toDate,
        },
        label: 'orders',
        link: '#'
      });
     
      this.subElements.ordersChart.append(ordersChart.element);

      this.components.push(ordersChart);

      const salesChart = new ColumnChart({
        url: 'api/dashboard/sales',
        range: {
          from: this.fromDate,
          to: this.toDate,
        },
        label: 'sales',
        link: '#'
      });
       
      this.subElements.salesChart.append(salesChart.element);

      this.components.push(salesChart);

      const customersChart = new ColumnChart({
        url: 'api/dashboard/customers',
        range: {
          from: this.fromDate,
          to: this.toDate,
        },
        label: 'sales',
        link: '#'
      });
         
      this.subElements.customersChart.append(customersChart.element);
    
      this.components.push(customersChart);

      const table = new SortableTable(header, {url: 'api/dashboard/bestsellers'});

      this.subElements.sortableTable.append(table.element);
    
      this.components.push(table);

      this.element.addEventListener('date-select', this.handleChangePeriod);

      return this.element;
        
    }

    getSubElements(element) {
      const elements = element.querySelectorAll('[data-element]');

      return [...elements].reduce((accum, subElement) => {
        accum[subElement.dataset.element] = subElement;

        return accum;
      }, {});
    }

    remove() {
      if (this.element) {
        this.components.forEach(component => component.destroy());
        this.element.removeEventListener('date-select', this.handleChangePeriod);
        this.element.remove();
        this.element = null;
      }

    }

    destroy () {
      this.remove();
    }

}
