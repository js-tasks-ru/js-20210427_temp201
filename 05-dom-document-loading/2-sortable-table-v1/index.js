export default class SortableTable {
  subElements = null;
  
  constructor(headerConfig = [], {data = []} = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
    this.initEventListeners();
  }

  getHeaderHtml () {
    return this.headerConfig.map(item => `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="${item.order || ''}">
        <span>${item.title}</span>
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

    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  sort(field, order) {
    //вычислим тип сортировки кологки из настроек
    const sortType = this.headerConfig.find(item => item.id === field).sortType;
    //сортируем данные
    this.data.sort((a, b) => {
      const aval = a[field]; 
      const bval = b[field];
      if (sortType === 'number') {
        return (aval - bval) * (order === 'desc' ? -1 : 1);
      }
      if (sortType === 'string') {
        return aval.localeCompare(bval) * (order === 'desc' ? -1 : 1);
      }
    });
    //сохраняем сортировку в настройки заголовков
    this.headerConfig = this.headerConfig.map(item => item.id === field ? {...item, order} : {...item, order: null});
    //обновляем компоненты
    this.subElements.header.innerHTML = this.getHeaderHtml();
    this.subElements.body.innerHTML = this.getDataHtml();
  }

  remove () {
    this.element.remove();
    this.subElements = null;
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }

}

