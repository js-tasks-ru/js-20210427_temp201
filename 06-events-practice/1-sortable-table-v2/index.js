export default class SortableTable {
  subElements = null;
  headerElements = null;
  
  constructor(headerConfig = [], {data = [], sorted = {}, isSortLocally = true} = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.render();
    this.sort();
    this.handleSortClick = this.handleSortClick.bind(this);
    this.initEventListeners();

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

  render() {
    const element = document.createElement('div'); // (*)

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

  initEventListeners () {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
    this.headerElements.forEach(element => {
      if (element.dataset.sortable === 'true') {
        // console.log(element);
        element.addEventListener('pointerdown', this.handleSortClick);
      }
    });
  }

  sortOnClient () {
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

  sortOnServer () {

  }

  sort(id = this.sorted.id, order = this.sorted.order) {
    this.sorted = {id, order};
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
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
      this.element.remove();
      this.element = null;
    }
    this.subElements = null;
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }

}

