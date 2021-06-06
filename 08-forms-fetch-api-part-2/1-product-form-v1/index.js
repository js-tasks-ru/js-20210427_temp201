import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

const defaultFormData = {
  title: '',
  description: '',
  quantity: 1,
  subcategory: '',
  status: 1,
  price: 100,
  discount: 0
};

export default class ProductForm {
  categoriesData = [];

  constructor (productId) {
    this.productId = productId;
    this.render();
  }

  async loadCategories () {
    this.categoriesData = await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async loadProduct () {
    this.productData = await fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`);
  }

  renderCategories() {
    return this.categoriesData.map(item => {
      if (!item.subcategories) {
        return '';
      }
      return item.subcategories.map(subitem => 
        `<option value="${escapeHtml(subitem.id)}">${escapeHtml(item.title)} &gt; ${escapeHtml(subitem.title)}</option>`).join('');
    }).join('');
  }

  async render () {

    const cat = this.loadCategories();
    const prod = this.loadProduct();
    await Promise.all([cat]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="product-form">
    <form data-element="productForm" class="form-grid" on>
    <div class="form-group form-group__half_left">
      <fieldset>
        <label class="form-label">Название товара</label>
        <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
      </fieldset>
    </div>
    <div class="form-group form-group__wide">
      <label class="form-label">Описание</label>
      <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
    </div>
    <div class="form-group form-group__wide" data-element="sortable-list-container">
      <label class="form-label">Фото</label>
      <div data-element="imageListContainer"><ul class="sortable-list"><li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="source" value="75462242_3746019958756848_838491213769211904_n.jpg">
        <span>
      <img src="icon-grab.svg" data-grab-handle="" alt="grab">
      <span>75462242_3746019958756848_838491213769211904_n.jpg</span>
    </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button></li></ul></div>
      <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
    </div>
    <div class="form-group form-group__half_left">
      <label class="form-label">Категория</label>
      <select class="form-control" name="subcategory" id="subcategory">
        ${this.renderCategories()}
      </select>
    </div>
    <div class="form-group form-group__half_left form-group__two-col">
      <fieldset>
        <label class="form-label">Цена ($)</label>
        <input required="" type="number" name="price" class="form-control" placeholder="100">
      </fieldset>
      <fieldset>
        <label class="form-label">Скидка ($)</label>
        <input required="" type="number" name="discount" class="form-control" placeholder="0">
      </fieldset>
    </div>
    <div class="form-group form-group__part-half">
      <label class="form-label">Количество</label>
      <input required="" type="number" class="form-control" name="quantity" placeholder="1">
    </div>
    <div class="form-group form-group__part-half">
      <label class="form-label">Статус</label>
      <select class="form-control" name="status">
        <option value="1">Активен</option>
        <option value="0">Неактивен</option>
      </select>
    </div>
    <div class="form-buttons">
      <button type="submit" name="save" class="button-primary-outline">
        Сохранить товар
      </button>
    </div>
  </form>
  </div>`;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  save = async (e) => {
    e.preventDefault();
    this.element.dispatchEvent(new CustomEvent(this.productId ? 'product-updated' : 'product-saved', { detail: {id: this.productId}}));
  };

  initEventListeners() {
    this.element.addEventListener('submit', this.save);
  }

  remove () {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy () {
    this.remove();
    // this.removeEventListeners();
  }
}
