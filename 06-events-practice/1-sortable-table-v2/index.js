export default class SortableTable {

    element;
    subElements = {};

    constructor(header, { data = []} = {}) {
        if (!header) {
            throw new Error('Error creating SortableTable. Header is not set');
        }
        this._header = header;
        this._data = data;

        this.render();
        this.initEventListeners();
    }

    render() {
        const element = document.createElement("div");
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);
    }

    handleSortClick(event) {
        const columnCell = event.target.closest('[data-sortable="true"]');
        columnCell.dataset.order = columnCell.dataset.order === 'asc' ? 'desc' : 'asc';
        this.sort(columnCell.dataset.id, columnCell.dataset.order);

        this.element.querySelectorAll('.sortable-table__sort-arrow').forEach(e => e.parentNode.removeChild(e));
        columnCell.insertAdjacentHTML('beforeend', this.getSortArrow());
    } 

    initEventListeners () {
        this.subElements.header.addEventListener('pointerdown', this.handleSortClick.bind(this));
    }

    get template() {
        return `
        <div data-element="productsContainer" class="products-list__container">
            <div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                    ${this.getTableHead(this._header)}
                </div>
                <div data-element="body" class="sortable-table__body">
                    ${this.getTableBody(this._data)}
                </div>
                <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                    <div>
                        <p>No products satisfies your filter criteria</p>
                        <button type="button" class="button-primary-outline">Reset all filters</button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');
        const subElements = {};
        [...elements].forEach(subElement => {
            subElements[subElement.dataset.element] = subElement;
        });
        return subElements;
    }

    getTableHead(header) {
        return header.map(item => {
            return `
            <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="asc">
                <span>${item.title}</span>
                 ${this.getSortArrowForItem(item)}
            </div>`;
        })
        .join('');
    }

    getTableBody(data) {
        return data.map(rowData => {
            return `
            <a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">
                ${this.getRow(rowData)}
            </a>`;
        })
        .join('');
    }

    getRow(data) {
        return this._header.map(headerCell => {
            if (headerCell.template) {
                return headerCell.template(data[headerCell.id]);
            } else {
                return `<div class="sortable-table__cell">${data[headerCell.id]}</div>`;
            }
        })
        .join('');
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.subElements = {};
        this.element = null;
    }

    sort(fieldValue, orderValue = 'asc') {
        const headerCell = this._header.find(cell => {
            return cell.id === fieldValue;
        });
        const {sortable, sortType} = headerCell;

        if (sortable) {
            const compare = this.makeCompare(sortType, fieldValue, orderValue);
            this._data = this.makeSorting(this._data, compare);
            this.subElements.body.innerHTML = this.getTableBody(this._data);
        }
    }

    makeCompare(sortType, fieldValue, orderValue) {
        const direction = this.getDirection(orderValue);
        const getter = this.createGetter(fieldValue);

        switch (sortType) {
            case 'number':
                return (a, b) => {
                        return direction * (getter(a) - getter(b));
                    };
            case 'string':
                return (a, b) => {
                        return direction * getter(a).localeCompare(getter(b), ['ru', 'en'], { caseFirst: 'upper' })
                    };
            default:
                throw new Error(`Wronge sort type ${sortType}`);
        }
    }

    getDirection(orderValue) {
        switch (orderValue) {
            case 'asc':
                return 1;
                break;
            case 'desc':
                return -1;
                break;
            default:
                throw new Error(`Wronge order value ${orderValue}`);
        }
    }

    makeSorting(array, compare) {
        return [...array].sort(compare);
    }

    createGetter(path) {
        const pathKeys = path.split('.');
        return function (obj) {
            return pathKeys.reduce((item, key) => { return item ? item[key] : item; }, obj);
        };
    }

    getSortArrow() {
        return `
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>`;
    }

    getSortArrowForItem(item) {
        if (item.id === 'title') {
            return this.getSortArrow();
        }
        return '';

    }
    

}

