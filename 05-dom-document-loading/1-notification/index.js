export default class NotificationMessage {
  constructor(message = '', {duration = 1000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
    this.initEventListeners();
    this.container = null;
    this.timerId = null;
  }
    
  render() {
    const element = document.createElement('div'); // (*)
    

    element.innerHTML = /*javascript*/`
      <div class="notification ${this.type}" style="--value:${this.duration}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
        `;
    
    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;
  }

  show(element) {
    if (this.timerId) {
      console.log(timerId);
      clearTimeout(timerId);
      this.container.removeChild(this.element);
      this.timerId = null;
    }
    this.container = element || document.body;
    this.container.append(this.element);
    this.timerId = setTimeout(() => {
      this.container.removeChild(this.element);
      this.timerId = null;
    }, this.duration);
  }
    
  initEventListeners () {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }
    
  remove () {
    this.element.remove();
  }
    
  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
