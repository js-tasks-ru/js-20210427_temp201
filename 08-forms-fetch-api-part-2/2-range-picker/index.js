function formatDate(date) {
  return date.toLocaleString('ru', {dateStyle: 'short'});
}

export default class RangePicker {
  
  constructor ({from = Date.now(), to = Date.now()}) {
    this.showStartDate = new Date(from);
    this.showStartDate.setDate(1);  
    this.from = from;
    this.to = to;
    this.isSelectorShown = false;
    this.selectedDates = {from: null, to: null};
    this.render();
    this.initEventListeners();
  }

  renderMonth (date) {
    const month = date.getMonth();
    const day = date.getDay();  
    let res = '';  
    let index = 1;
    // console.log(date.toISOString());
    while (month === date.getMonth()) {  
      const classes = [];
      if (this.selectedDates.from && date.toISOString() === this.selectedDates.from.toISOString()) {
        classes.push('rangepicker__selected-from');
      }  
      if (this.selectedDates.to && date.toISOString() === this.selectedDates.to.toISOString()) {
        classes.push(' rangepicker__selected-to');
      } 
      if (this.selectedDates.to && this.selectedDates.from && date > this.selectedDates.from && date < this.selectedDates.to) {
        classes.push('rangepicker__selected-between');
      }
      res += `<button type="button" class="rangepicker__cell ${classes.join(' ')}" data-value="${date.toISOString()}" style="${index === 1 ? '--start-from: ' + day : ''}">${index}</button>`;
      date.setDate(date.getDate() + 1);
      index++;
    }
    return res;
  }

  renderMonthContainer (date) {
    const month = date.toLocaleString('default', { month: 'long' });
    return `<div class="rangepicker__calendar">
    <div class="rangepicker__month-indicator">
      <time datetime="${month}">${month}</time>
    </div>
    <div class="rangepicker__day-of-week">
      <div>Пн</div>
      <div>Вт</div>
      <div>Ср</div>
      <div>Чт</div>
      <div>Пт</div>
      <div>Сб</div>
      <div>Вс</div>
    </div>
    <div class="rangepicker__date-grid">
      ${this.renderMonth(date)}
    </div>
  </div>`;
  }

  renderSelector() {
    if (!this.isSelectorShown) {
      return '';
    } 
    const firstMonth = new Date(this.showStartDate);
    const secondMonth = new Date(this.showStartDate);
    secondMonth.setMonth(secondMonth.getMonth() + 1); 
    return `<div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.renderMonthContainer(firstMonth)}
      ${this.renderMonthContainer(secondMonth)}
      `
    ;
  }

  renderInput () {
    return `<span data-element="from">${formatDate(this.from)}</span> -
      <span data-element="to">${formatDate(this.to)}</span>`;
  }

  render () {
    const element = document.createElement('div');
    element.innerHTML = `<div class="rangepicker rangepicker_open">
      <div class="rangepicker__input" data-element="input">
        ${this.renderInput()}
      </div>
      <div class="rangepicker__selector" data-element="selector">
      </div>
    </div>`;
    
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    
    this.closeCalendar();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  handleClickInput = () => {
    this.element.classList.toggle('rangepicker_open');
    this.isSelectorShown = !this.isSelectorShown;
    if (this.isSelectorShown) {
      this.selectedDates = {from: this.from, to: this.to};
    }
    this.subElements.selector.innerHTML = this.renderSelector();
  };

  closeCalendar = () => {
    this.element.classList.remove('rangepicker_open');
    this.isSelectorShown = false;
    this.subElements.selector.innerHTML = this.renderSelector();
  };

  handleDocumentClick = (event) => {
    if (this.element.classList.contains('rangepicker_open') && !this.element.contains(event.target)) {
      this.closeCalendar();
    }
  }

  handleClickSelector = (event) => {
    if (event.target.closest('.rangepicker__selector-control-left')) {
      this.showStartDate.setMonth(this.showStartDate.getMonth() - 1);
      this.subElements.selector.innerHTML = this.renderSelector();
      return;
    }
    if (event.target.closest('.rangepicker__selector-control-right')) {
      this.showStartDate.setMonth(this.showStartDate.getMonth() + 1);
      this.subElements.selector.innerHTML = this.renderSelector();
      return;
    }
    const dayElement = event.target.closest('.rangepicker__cell');
    if (dayElement) {
      const dayElement = event.target.closest('.rangepicker__cell');
      if (this.selectedDates.from && this.selectedDates.to) {
        this.selectedDates = {from: new Date(dayElement.dataset.value), to: null};
        this.subElements.selector.innerHTML = this.renderSelector();
        return;
      }
      if (this.selectedDates.from && (new Date(dayElement.dataset.value) >= this.selectedDates.from)) {
        this.selectedDates.to = new Date(dayElement.dataset.value);
        this.subElements.selector.innerHTML = this.renderSelector();
        this.from = new Date(this.selectedDates.from);
        this.to = new Date(this.selectedDates.to);
        //this.isSelectorShown = false;
        //this.element.classList.remove('rangepicker_open');
        this.subElements.input.innerHTML = this.renderInput();
        this.subElements.selector.innerHTML = this.renderSelector();
        this.element.dispatchEvent(new CustomEvent('date-select', {detail: {from: this.from, to: this.to}}));
        return;
      }
    }
  };

  initEventListeners () {
    this.subElements.input.addEventListener('click', this.handleClickInput);
    this.subElements.selector.addEventListener('click', this.handleClickSelector);
    document.addEventListener('click', this.handleDocumentClick, true);
  }

  remove () {
    if (this.element) {
      this.subElements.input.removeEventListener('click', this.handleClickInput);
      this.element.remove();
      this.element = null;
    }
    this.subElements = null;
  }

  destroy () {
    this.remove();
    document.removeEventListener('click', this.handleDocumentClick, true);
  }

}
