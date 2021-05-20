export default class NotificationMessage {
  static lastNotificationElement = null;
  static timerId = null;

  constructor(message = '', {duration = 1000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
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

  clear () {
    clearTimeout(NotificationMessage.timerId);
    NotificationMessage.lastNotificationElement.remove();
    NotificationMessage.lastNotificationElement = null;
    NotificationMessage.timerId = null;
    this.remove();
  }

  show(element = document.body) {
    if (NotificationMessage.timerId) {
      this.clear();
    }
    element.append(this.element);
    NotificationMessage.lastNotificationElement = this.element;
    NotificationMessage.timerId = setTimeout(() => {
      this.clear();
    }, this.duration);
  }
    
  remove () {
    this.element.remove();
  }
    
  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
