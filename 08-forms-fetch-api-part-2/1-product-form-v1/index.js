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
  discount: 0,
  images: [],
};

export default class ProductForm {
  categoriesData = [];

  constructor (productId) {
    this.productId = productId;
    // this.render();
  }

  async loadCategories () {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async loadProduct () {
    return await fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`);
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

  renderImageListItem (item) {
    return `<li class="products-edit__imagelist-item sortable-list__item">
      <span>
        <img src="./icon-grab.svg" data-grab-handle alt="grab">
        <img class="sortable-table__cell-img" alt="${escapeHtml(item.source)}" src="${escapeHtml(item.url)}">
        <span>${escapeHtml(item.source)}</span>
      </span>
      <button type="button">
        <img src="./icon-trash.svg" alt="delete" data-delete-handle>
      </button>
    </li>`;
  }

  renderImagesList () {
    return `<ul class="sortable-list">
      ${this.formData.images.map(item => this.renderImageListItem(item)).join('')}
    </ul>`;
  }

  async render () {

    const categoriesPromise = this.loadCategories();
    const productPromise = this.productId ? this.loadProduct() : [this.defaultFormData];
    const [categoriesResponse, productResponse] = await Promise.all([categoriesPromise, productPromise]);

    this.categoriesData = categoriesResponse;

    this.formData = productResponse[0];

    const element = document.createElement('div');
    element.innerHTML = `<div class="product-form">
    <form data-element="productForm" class="form-grid" on>
    <div class="form-group form-group__half_left">
      <fieldset>
        <label class="form-label">Название товара</label>
        <input required="" type="text" name="title" class="form-control" placeholder="Название товара" id="title">
      </fieldset>
    </div>
    <div class="form-group form-group__wide">
      <label class="form-label">Описание</label>
      <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
    </div>
    <div class="form-group form-group__wide" data-element="sortable-list-container">
      <label class="form-label">Фото</label>
      <div data-element="imageListContainer">
        ${this.renderImagesList()}
      </div>
      <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
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
        <input required="" type="number" id="price" name="price" class="form-control" placeholder="${defaultFormData.price}">
      </fieldset>
      <fieldset>
        <label class="form-label">Скидка ($)</label>
        <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="${defaultFormData.discount}">
      </fieldset>
    </div>
    <div class="form-group form-group__part-half">
      <label class="form-label">Количество</label>
      <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="${defaultFormData.price}">
    </div>
    <div class="form-group form-group__part-half">
      <label class="form-label">Статус</label>
      <select class="form-control" id="status" name="status">
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

    this.fillFormData();

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

  fillFormData () {
    const {productForm} = this.subElements;
    Object.keys(this.formData).forEach(key => {
      const element = productForm.querySelector(`#${key}`);
      if (element && key !== 'images') {
        element.value = this.formData[key];
      }
    });
  }

  save = async () => {
    const {productForm} = this.subElements;
    Object.keys(this.formData).forEach(key => {
      const element = productForm.querySelector(`#${key}`);
      if (element && key !== 'images') {
        this.formData[key] = element.getAttribute('type') === 'number' || key === 'status' ? parseInt(element.value) : element.value;
      }
    });
    const {imageListContainer} = this.subElements;
    const imageElements = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    this.formData.images = [];
    imageElements.forEach(element => {
      this.formData.images.push({url: element.getAttribute('src'), source: element.getAttribute('alt')});
    });
    // console.log(this.formData);

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.formData)
      });

      this.element.dispatchEvent(new CustomEvent(this.productId ? 'product-updated' : 'product-saved', { detail: {id: result.id}}));
  
    } catch (error) {
      console.error('something went wrong', error);
    }

  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.save();
  };

  initEventListeners() {

    const {productForm, uploadImage, imageListContainer} = this.subElements; 
    
    productForm.addEventListener('submit', this.handleSubmit);
    uploadImage.addEventListener('click', this.uploadImage);

    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  uploadImage = () => {
    console.log('HERE');
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData
        });

        console.log(result);

        const imageElement = document.createElement('div');
        imageElement.innerHTML = this.renderImageListItem({url: result.data.link, source: file.name});
        imageListContainer.append(imageElement.firstElementChild);

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        // Remove input from body
        fileInput.remove();
      }
    });

    // must be in body for IE
    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

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
