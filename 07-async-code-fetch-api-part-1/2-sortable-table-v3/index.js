import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

const DEFAULT_END = 30;

export default class SortableTable {
  subElements = null;
  headerElements = null;
  
  constructor(headerConfig = [], {url, sorted = {}, isSortLocally = false, embed = 'subcategory.category'} = {}) {
    this.headerConfig = headerConfig;
    this.url = url;
    this.sorted = sorted;
    this._start = 0;
    this._end = DEFAULT_END;
    this._embed = embed;
    this.isSortLocally = isSortLocally;
    this.handleSortClick = this.handleSortClick.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.render();
  }

  getHeaderHtml () {
    return this.headerConfig.map(item => `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="${item.order || ''}">
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow">
          </span>
        </span>
      </div>
    `).join('');
  }

  getDataHtml () {
    if (!this.data) {
      return '';
    }

    return this.data.map(item => `
      <a href="#" class="sortable-table__row">
        ${this.headerConfig.map(headerItem => {
    if (headerItem.template) {
      return headerItem.template(item[headerItem.id]);
    } else {
      return `<div class="sortable-table__cell">${item[headerItem.id]}</div>`;
    }

  }).join('')}
      </a>
    `).join('');
  }

  async loadData (appendMode = false) {
    try {
      let data;
      await fetchJson(`${BACKEND_URL}/${this.url}?_embed=${this._embed}&_sort=${this.sorted.id}&_order=${this.sorted.order}&_start=${this._start}&_end=${this._end}`)
        .then(json => data = json);
      this.data = appendMode ? [...this.data, ...data] : data;
      if (data && data.length) {
        window.addEventListener('scroll', this.handleScroll);
      }
      this.subElements.body.innerHTML = this.getDataHtml();
    }
    catch (err) {
      // console.log(err);
    }
  }

  async render() {
    const element = document.createElement('div'); // (*)

    if (!this.sorted.id || !this.sorted.order) {
      const findedFirstSortedColumn = this.headerConfig.find(item => item.sortable);
      this.sorted = {id: findedFirstSortedColumn.id, order: 'asc'};
    }

    element.innerHTML = /*javascript*/`
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaderHtml()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getDataHtml()}
        </div>  
      </div>
    `;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.headerElements = this.element.querySelectorAll('.sortable-table__cell');

    this.headerConfig = this.headerConfig.map(item => item.id === this.sorted.id ? {...item, order: this.sorted.order} : {...item, order: null});
    this.headerElements.forEach(element => element.dataset.order = element.dataset.id === this.sorted.id ? this.sorted.order : null);

    this.initEventListeners();

    await this.loadData();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  handleSortClick (e) {
    this.sorted = {id: e.currentTarget.dataset.id, order: this.sorted.order === 'asc' ? 'desc' : 'asc'};
    this.sort();
  }

  handleScroll (e) {
    // console.log(document.documentElement.getBoundingClientRect().bottom, document.documentElement.clientHeight);
    if (document.documentElement.getBoundingClientRect().bottom<document.documentElement.clientHeight + 100) {
      window.removeEventListener('scroll', this.handleScroll);
      const end = this._end;
      this._end = end + DEFAULT_END;
      this._start = end + 1;
      this.loadData(true);
    }
  }

  initEventListeners () {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
    this.headerElements.forEach(element => {
      if (element.dataset.sortable === 'true') {
        element.addEventListener('pointerdown', this.handleSortClick);
      }
    });
  }

  sortOnClient (id, order) {
    this.sorted = {id, order};
    //вычислим тип сортировки колонки из настроек
    const sortType = this.headerConfig.find(item => item.id === this.sorted.id).sortType;
    //сортируем данные
    this.data.sort((a, b) => {
      const aval = a[this.sorted.id]; 
      const bval = b[this.sorted.id];
      if (sortType === 'number') {
        return (aval - bval) * (this.sorted.order === 'desc' ? -1 : 1);
      }
      if (sortType === 'string') {
        return aval.localeCompare(bval, ['ru', 'en'], {caseFirst: 'upper'}) * (this.sorted.order === 'desc' ? -1 : 1);
      }
    });
  }

  async sortOnServer (id, order) {
    this.sorted = {id, order};
    this._start = 0;
    this._end = DEFAULT_END;
    await this.loadData();
  }

  async sort(id = this.sorted.id, order = this.sorted.order) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      await this.sortOnServer(id, order);
    }
    //сохраняем сортировку в настройки заголовков
    this.headerConfig = this.headerConfig.map(item => item.id === id ? {...item, order} : {...item, order: null});
    this.headerElements.forEach(element => element.dataset.order = element.dataset.id === id ? order : null);
    //обновляем компоненты
    // this.subElements.header.innerHTML = this.getHeaderHtml();
    this.subElements.body.innerHTML = this.getDataHtml();
  }

  remove () {
    if (this.headerElements) {
      this.headerElements.forEach(element => element.removeEventListener('pointerdown', this.handleSortClick));
      this.headerElements = null;
    }
    if (this.element) {
      window.removeEventListener('scroll', this.handleScroll);
      this.element.remove();
      this.element = null;
    }
    this.subElements = null;
  }

  destroy() {
    this.remove();
  }

}


