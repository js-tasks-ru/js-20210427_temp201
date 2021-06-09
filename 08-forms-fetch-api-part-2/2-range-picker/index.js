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

  highlightDates () {
    const days = this.subElements.selector.querySelectorAll('.rangepicker__cell');
    days.forEach(day => {
      day.classList = 'rangepicker__cell';  
      if (this.selectedDates.from && day.dataset.value === this.selectedDates.from.toISOString()) {
        day.classList.add('rangepicker__selected-from');
      }  
      if (this.selectedDates.to && day.dataset.value === this.selectedDates.to.toISOString()) {
        day.classList.add('rangepicker__selected-to');
      } 
      if (this.selectedDates.to && this.selectedDates.from && new Date(day.dataset.value) > this.selectedDates.from && new Date(day.dataset.value) < this.selectedDates.to) {
        day.classList.add('rangepicker__selected-between');
      }
    });
  }

  renderMonth (date) {
    const month = date.getMonth();
    const day = date.getDay();  
    let res = '';  
    let index = 1;
    while (month === date.getMonth()) {  
      res += `<button type="button" class="rangepicker__cell" data-value="${date.toISOString()}" style="${index === 1 ? '--start-from: ' + day : ''}">${index}</button>`;
      date.setDate(date.getDate() + 1);
      index++;
    }
    return res;
  }

  renderMonthContainer (date) {
    const month = date.toLocaleString('default', { month: 'long' });
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="rangepicker__calendar">
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
    return wrapper.firstElementChild;
  }

  renderSelectorSides() {
    const sidesList = this.subElements.selector.querySelectorAll('.rangepicker__calendar');
    for (const side of sidesList) {
      side.remove();
    }
    const firstMonth = new Date(this.showStartDate);
    const secondMonth = new Date(this.showStartDate);
    secondMonth.setMonth(secondMonth.getMonth() + 1); 
    this.subElements.selector.append(this.renderMonthContainer(firstMonth));
    this.subElements.selector.append(this.renderMonthContainer(secondMonth));
  }

  renderSelector() {
    return `<div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
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
      <div class="rangepicker__selector" data-element="selector"></div>
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
      if (!this.subElements.children) {
        this.subElements.selector.innerHTML = this.renderSelector();
        this.renderSelectorSides();
      }
      this.selectedDates = {from: this.from, to: this.to};
      this.highlightDates();
    }
    // this.subElements.selector.innerHTML = this.renderSelector();
  };

  closeCalendar = () => {
    this.element.classList.remove('rangepicker_open');
    this.isSelectorShown = false;
  };

  handleDocumentClick = (event) => {
    if (this.element.classList.contains('rangepicker_open') && !this.element.contains(event.target)) {
      this.closeCalendar();
    }
  }

  handleClickSelector = (event) => {
    if (event.target.closest('.rangepicker__selector-control-left')) {
      this.showStartDate.setMonth(this.showStartDate.getMonth() - 1);
      this.renderSelectorSides();
      this.highlightDates();
      return;
    }
    if (event.target.closest('.rangepicker__selector-control-right')) {
      this.showStartDate.setMonth(this.showStartDate.getMonth() + 1);
      this.renderSelectorSides();
      this.highlightDates();
      return;
    }
    const dayElement = event.target.closest('.rangepicker__cell');
    if (dayElement) {
      const dayElement = event.target.closest('.rangepicker__cell');
      if (this.selectedDates.from && this.selectedDates.to) {
        this.selectedDates = {from: new Date(dayElement.dataset.value), to: null};
        // this.subElements.selector.innerHTML = this.renderSelector();
        this.highlightDates();
        return;
      }
      if (this.selectedDates.from && (new Date(dayElement.dataset.value) >= this.selectedDates.from)) {
        this.selectedDates.to = new Date(dayElement.dataset.value);
        this.from = new Date(this.selectedDates.from);
        this.to = new Date(this.selectedDates.to);
        this.isSelectorShown = false;
        this.element.classList.remove('rangepicker_open');
        this.subElements.from.innerHTML = formatDate(this.from);
        this.subElements.to.innerHTML = formatDate(this.to);
        this.highlightDates();
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
