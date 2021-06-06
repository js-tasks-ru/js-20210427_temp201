export default class SortableList {

  draggableItem = null;
  replacedItem = null;
  insertType = null;

  constructor ({items = []} = {}) {
    this.items = items;
    this.render();
    this.initEventListeners();
  }

  handlePointerDown = (e) => {
    if (e.target.hasAttribute('data-delete-handle')) {
      let elem = e.target.closest('.sortable-list__item');
      elem.remove();
      elem = null;
    } else if (e.target.hasAttribute('data-grab-handle')) {
      this.draggableItem = e.target.closest('.sortable-list__item');
      if (this.draggableItem) { 
        // e.preventDefault();
        const {x, y} = this.draggableItem.getBoundingClientRect();
        this.shiftX = e.clientX - x;
        this.shiftY = e.clientY - y;
        this.element.insertBefore(this.placeholder, this.draggableItem);
        this.draggableItem.classList.add('sortable-list__item_dragging');
        this.draggableItem.style.left = e.clientX - this.shiftX + 'px'; 
        this.draggableItem.style.top = e.clientY - this.shiftY + 'px';
        this.draggableItem.style.width = this.placeholder.offsetWidth + 'px';
      }
    }
  }

  handleMouseMove = (e) => {
    if (this.draggableItem) {
      e.preventDefault();
      const display = this.draggableItem.style.display;
      this.draggableItem.style.display = 'none';  
      let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
      if (elemBelow) {
        let droppableBelow = elemBelow.closest('.sortable-list__item');
        if (droppableBelow) {
          this.replacedItem = droppableBelow;
          const placeholderClientY = this.placeholder.getBoundingClientRect().top;
          this.placeholder.remove();
          this.insertType = placeholderClientY > this.replacedItem.getBoundingClientRect().top ? 'beforebegin' : 'afterend';
          droppableBelow.insertAdjacentElement(this.insertType, this.placeholder);
        }
      }
      this.draggableItem.style.display = display;  
      this.draggableItem.style.left = e.clientX - this.shiftX + 'px'; 
      this.draggableItem.style.top = e.clientY - this.shiftY + 'px';
    }
  }

  handlePointerUp = () => {
    if (this.draggableItem) {
      this.draggableItem.classList.remove('sortable-list__item_dragging');
      this.draggableItem.style = '';
      if (this.draggableItem && this.replacedItem) {
        this.draggableItem.remove();
        this.replacedItem.insertAdjacentElement(this.insertType, this.draggableItem);
      }
      this.placeholder.remove();
      this.draggableItem = null;
      this.replacedItem = null;
    }
  }

  render () {
    const element = document.createElement('div');

    element.innerHTML = `<ul class='sortable-list'>
    </ul>`;

    this.element = element.firstElementChild;
    this.items.forEach(item => {
      item.classList.add('sortable-list__item');
      return this.element.append(item);
    });

    this.placeholder = document.createElement('li');
    this.placeholder.classList.add('sortable-list__placeholder');
    this.placeholder.style = 'width: 100%; height: 60px;';
  }

  initEventListeners () {
    document.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('pointerup', (e) => this.handlePointerUp(e));
  }

  removeEventListeners () {
    document.removeEventListener('pointerdown', (e) => this.handlePointerDown(e));
    document.removeEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.removeEventListener('pointerup', (e) => this.handlePointerUp(e));
  }

  addItem(item) {
    this.element.append(item);
  }

  remove () {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    if (this.placeholder) {
      this.placeholder.remove();
      this.placeholder = null;
    }
  }

  destroy () {
    this.remove();
    this.removeEventListeners();
  }
}
