class Tooltip {
  static instance = null;
  
  constructor () {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
    this.render();

  }

  render () {
    const element = document.createElement('div');
    element.innerHTML = `<div class="tooltip">This is tooltip</div>`;

    this.element = element.firstElementChild;
  }

  initialize () {
    document.body.addEventListener('pointerover', (e) => {
      if (e.target.dataset.tooltip) {
        console.log('over', e.currentTarget);
        e.target.append(this.element);
      }
    });
    document.body.addEventListener('pointerout', (e) => {
      if (e.target.dataset.tooltip) {
        console.log('out', e.currentTarget);
        e.target.removeChild(this.element);
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
