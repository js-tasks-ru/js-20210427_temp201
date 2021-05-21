class Tooltip {
  static instance = null;
  
  constructor () {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerOver = this.handlePointerOver.bind(this);
    this.handlePointerOut = this.handlePointerOut.bind(this);
  }

  handlePointerMove (e) {
    this.element.style = `left: ${e.clientX + 10}px; top: ${e.clientY + 10}px;`;
  }

  handlePointerOver (e) {
    if (e.target.dataset.tooltip) {
      this.render(e.target.dataset.tooltip);
    }
  }

  handlePointerOut (e) {
    if (e.target.dataset.tooltip) {
      this.remove();
    }
  }

  render (title = 'Default tooltip') {
    const element = document.createElement('div');
    element.innerHTML = `<div class="tooltip">${title}</div>`;

    this.element = element.firstElementChild;
    document.body.append(this.element);
    document.body.addEventListener('pointermove', this.handlePointerMove);
  }

  initialize () {
    document.body.addEventListener('pointerover', this.handlePointerOver);
    document.body.addEventListener('pointerout', this.handlePointerOut);
  }

  remove () {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy () {
    document.body.removeEventListener('pointerover', this.handlePointerOver);
    document.body.removeEventListener('pointerout', this.handlePointerOut);
    this.remove();
    Tooltip.instance = null;
  }

}

export default Tooltip;
