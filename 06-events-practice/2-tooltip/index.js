class Tooltip {
  static instance = null;
  
  constructor () {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;

  }

  render (title = 'Default tooltip') {
    const element = document.createElement('div');
    element.innerHTML = `<div class="tooltip">${title}</div>`;

    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  initialize () {
    document.body.addEventListener('pointerover', (e) => {
      if (e.target.dataset.tooltip) {
        this.render(e.target.dataset.tooltip);
      }
    });
    document.body.addEventListener('pointerout', (e) => {
      if (e.target.dataset.tooltip) {
        this.remove();
      }
    });
  }

  remove () {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy () {
    this.remove();
    Tooltip.instance = null;
  }

}

export default Tooltip;
