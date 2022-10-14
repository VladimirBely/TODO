'use strict';

!(function () {

    function createElement({
        tagName = 'div',
        classes = [],
        attributes = {},
        textContent = '' }) {
        if (typeof tagName !== 'string') {
            console.warn('tagName createElement method of App must be a string');
            let errorElement = document.createElement('div');
            errorElement.textContent = 'tagName must be a string';
            return errorElement;
        }

        let element = document.createElement(tagName);

        if (typeof textContent === 'string') {
            element.textContent = textContent;
        } else {
            console.warn('textContent must be a string');
        }

        if (Array.isArray(classes)) {
            classes.forEach(className => {
                if (typeof className === 'string') {
                    element.classList.add(className);
                } else {
                    console.warn('classes must be a string');
                }
            });
        }

        if (typeof attributes === 'object' && attributes) {
            Object.entries(attributes).forEach(pair => {
                if (typeof pair[0] === 'string' && typeof pair[1] === 'string') {
                    element.setAttribute(pair[0], pair[1]);
                } else {
                    console.warn(`Element's attributes must be a string`);
                }
            });
        }
        return element;
    }

    class App {
        constructor() {
            this.cardsArr = [];
            this._body = document.body;
            this._init();
        }

        _init() {
            this._createApp();
            this._getCards();
            this._attachEvents();
        }

        _attachEvents() {
            this.formButton.addEventListener('click', this._formAction.bind(this));
            this._cardsBlock.addEventListener('click', event => {
                switch (event.target) {
                    case this._sortButtonImportant:
                        this._changeButtonTextContent(this._sortButtonImportant);
                        this._sortCardsReverseImportant();
                        break;
                    case this._sortButtonDone:
                        this._changeButtonTextContent(this._sortButtonDone);
                        this._sortCardsReverseDone();
                        break;
                    case this._sortButtonDefault:
                        this._changeButtonTextContent(this._sortButtonDefault);
                        this._sortCardsReverseDefault();
                        break;
                }
            });
        }

        _createApp() {
            let appBlock = createElement({ classes: ['container'] });
            let formBlock = createElement({ classes: ['container', 'form-container'] });
            let title = createElement({
                tagName: 'h1',
                textContent: 'Awesome TODO App'
            });
            this.formButton = createElement({
                tagName: 'button',
                classes: ['btn', 'btn-primary'],
                textContent: 'Create card',
                attributes: { 'data-role': 'create' }
            });
            this._cardsBlock = createElement({
                classes: ['container', 'cards-block']
            });
            this._nameField = createElement({
                tagName: 'input',
                classes: ['form-control'],
                attributes: { placeholder: 'Name' },
                autocomplete: 'autocomplete'
            });
            this._descriptionField = createElement({
                tagName: 'textarea',
                classes: ['form-control'],
                attributes: {
                    placeholder: 'Description',
                    autocomplete: 'autocomplete'
                }
            });

            /* *Blocks for different states of cards* */
            this._importantBlock = createElement({
                classes: ['container', 'important-container']
            });
            this._completedBlock = createElement({
                classes: ['container', 'completed-container']
            });
            this._defaultBlock = createElement({
                classes: ['container', 'default-container']
            });

            let importantTitle = createElement({
                tagName: 'h2',
                textContent: 'Prioritized Tasks'
            });
            let completedTitle = createElement({
                tagName: 'h2',
                textContent: 'Completed Tasks'
            });
            let defaultTitle = createElement({
                tagName: 'h2',
                textContent: 'Unprioritized Tasks'
            });

            this._sortButtonImportant = createElement({
                tagName: 'button',
                classes: ['btn', 'btn-primary', 'btn-sort'],
                textContent: 'A - Z'
            });
            this._sortButtonDone = createElement({
                tagName: 'button',
                classes: ['btn', 'btn-primary', 'btn-sort'],
                textContent: 'A - Z'
            });
            this._sortButtonDefault = createElement({
                tagName: 'button',
                classes: ['btn', 'btn-primary', 'btn-sort'],
                textContent: 'A - Z'
            });

            this._importantBlock.append(importantTitle, this._sortButtonImportant);
            this._defaultBlock.append(defaultTitle, this._sortButtonDefault);
            this._completedBlock.append(completedTitle, this._sortButtonDone);

            this._cardsBlock.append(this._importantBlock, this._defaultBlock, this._completedBlock);
            formBlock.append(title, this._nameField, this._descriptionField, this.formButton);
            appBlock.append(formBlock, this._cardsBlock);
            this._body.append(appBlock);
        }

        _getCards() {
            let cardsData;

            this._request({
                callback: responseData => {
                    cardsData = JSON.parse(responseData.data);
                    this.cardsArr = cardsData.map(cardData => {
                        return new Card({
                            cardTitle: cardData.title,
                            cardText: cardData.text,
                            isImportance: cardData.importance,
                            isDone: cardData.done,
                            id: cardData.id
                        });
                    });
                    this._insertCards();
                    this._sortCards();
                }
            });
        }

        _insertCards() {
            this.importantArr = [];
            this.doneArr = [];
            this.defaultArr = [];

            this.cardsArr.forEach(card => {
                if (card.element.classList.contains('card--importance')) {
                    this.importantArr.push(card);
                }
                else if (card.element.classList.contains('card--done')) {
                    this.doneArr.push(card);
                }
                else {
                    this.defaultArr.push(card);
                }
            });
            this._sortCards();
        }

        _changeButtonTextContent(sortButton) {
            if (sortButton.textContent === 'A - Z') {
                sortButton.textContent = 'Z - A';
            }
            else {
                sortButton.textContent = 'A - Z';
            }
        }

        _sortCards() {
            this.importantArr.sort((a, b) => (a.title > b.title ? 1 : -1));
            this.importantArr.forEach(card => {
                this._importantBlock.append(card.element);
            });
            this.doneArr.sort((a, b) => (a.title > b.title ? 1 : -1));
            this.doneArr.forEach(card => {
                this._completedBlock.append(card.element);
            });
            this.defaultArr.sort((a, b) => (a.title > b.title ? 1 : -1));
            this.defaultArr.forEach(card => {
                this._defaultBlock.append(card.element);
            });
        }

        _sortCardsReverseImportant() {
            if (this.importantArr !== 'undefined' || this.importantArr.length > 0) {
                this.importantArr.reverse();
                this.importantArr.forEach(card => {
                    this._importantBlock.append(card.element);
                });
            } else {
                console.warn(`You don't have cards to sort in this category`);
                return;
            }

        }

        _sortCardsReverseDone() {
            if (this.importantArr !== 'undefined' || this.importantArr.length > 0) {
                this.doneArr.reverse();
                this.doneArr.forEach(card => {
                    this._completedBlock.append(card.element);
                });
            } else {
                console.warn(`You don't have cards to sort in this category`);
                return;
            }
        }

        _sortCardsReverseDefault() {
            if (this.importantArr !== 'undefined' || this.importantArr.length > 0) {
                this.defaultArr.reverse();
                this.defaultArr.forEach(card => {
                    this._defaultBlock.append(card.element);
                });
            } else {
                console.warn(`You don't have cards to sort in this category`);
                return;
            }
        }

        _getFormData() {
            let cardData = {};
            cardData.cardTitle = this._nameField.value;
            cardData.cardText = this._descriptionField.value;

            return cardData;
        }

        _validateForm() {
            let textFieldStates = [];
            textFieldStates.push(this._validateTextFields(this._nameField));
            textFieldStates.push(this._validateTextFields(this._descriptionField));

            return !textFieldStates.some(state => state === false);
        }

        _checkExistingCard() {
            this.cardData = this._getFormData();
            return this.cardsArr.some(card => card.title === this.cardData.cardTitle);
        }

        _getCardsStates(card, isCreate) {
            let cardsStates = {
                title: card.title,
                text: card.text,
                importance: card.isImportance,
                done: card.isDone
            };

            if (!isCreate) {
                cardsStates.id = card.id;
            }

            return cardsStates;
        }

        _request({ method = 'GET', card, isCreate, message = '', callback }) {
            let options = {
                method
            };

            if (method !== 'GET') {
                options.body = JSON.stringify(this._getCardsStates(card));
            }

            fetch(App.API_ENDPOINT, options).then(response => response.json())
                .then(responseData => {
                    if (responseData.status === 0) {
                        callback(responseData);
                        if (message) alert(message);
                    } else {
                        alert(responseData.errorText);
                    }
                }).catch(error => {
                    alert(error);
                });
        }

        _formAction() {
            if (!this._validateForm()) {
                return;
            }

            if (this._checkExistingCard()) {
                let isCreate = confirm(`You already have a card with current title.
                \nDo you want to add one more?`);
                if (!isCreate) {
                    return;
                }
            }

            if (this.formButton.dataset.role === 'create') {

                let card = new Card(this.cardData);
                this.cardsArr.push(card);

                this._request({
                    method: 'POST',
                    card,
                    isCreate: true,
                    message: 'Card was created',
                    callback: responseData => {
                        card.id = responseData.data.id;
                        this._defaultBlock.append(card.element);
                        this._resetForm();
                        this._restartApp();
                    }
                });

            } else if (this.formButton.dataset.role === 'update') {
                this.editableCard.title = this._nameField.value;
                this.editableCard.text = this._descriptionField.value;
                this._updateRequest(this.editableCard);
            }
        }

        _updateRequest(card) {
            this._request({
                method: 'PUT',
                card,
                isCreate: false,
                message: 'Card was updated',
                callback: () => {
                    card._updateCard();
                    this._resetForm();
                    this._restartApp();
                }
            });
        }

        _resetForm() {
            this._nameField.value = '';
            this._descriptionField.value = '';
            this.formButton.textContent = 'Create card';
            this.formButton.setAttribute('data-role', 'create');
        }

        _restartApp() {
            document.querySelector('body').innerHTML = '';
            app._init();
        }

        _validateTextFields(field) {
            if (field.value === '') {
                field.classList.add('is-invalid');
                return false;
            } else {
                field.classList.remove('is-invalid');
                return true;
            }
        }

        updateCard(card, importanceChange) {
            if (importanceChange) {
                this._updateRequest(card);
                return;
            }
            this._nameField.value = card.title;
            this._descriptionField.value = card.text;
            this.formButton.textContent = 'Save card';
            this.formButton.setAttribute('data-role', 'update');

            this.editableCard = card;
        }

        deleteCard(card) {
            if (!confirm(`Are you sure, you want to delete ${card.title} card?`)) return;

            this._request({
                method: 'DELETE',
                card,
                isCreate: false,
                message: 'Card was deleted',
                callback: () => {
                    card.element.remove();
                    this._restartApp();
                }
            });
        }

        completeCard(card, doneChange) {
            if (doneChange) {
                this._updateRequest(card);
                return;
            }

        }
    }

    App.API_ENDPOINT = 'http://localhost:8080/api';

    class Card {
        constructor({ cardTitle = '', cardText = '', isImportance = false, isDone = false, id }) {
            this.title = cardTitle;
            this.text = cardText;
            this.isImportance = isImportance;
            this.isDone = isDone;
            this._id = id;
            this._init();
        }

        set id(value) {
            this._id = value;
        }

        get id() {
            return this._id;
        }

        _init() {
            this.element = this._createElement();
            this._attachEvents();
        }

        _attachEvents() {
            this._deleteButton.addEventListener('click', () => {
                this._deleteCard();
            });

            this._updateButton.addEventListener('click', () => {
                this._updateCard();
            });

            this._importanceCheckbox.addEventListener('change', () => {
                this.isImportance = this._importanceCheckbox.checked;
                app.updateCard(this, true);
                if (this.isImportance) {
                    this.element.classList.add('card--importance');
                } else {
                    this.element.classList.remove('card--importance');
                }
            });

            this._doneCheckbox.addEventListener('change', () => {
                this._completeCard();
            });
        }

        _updateCard() {
            this.titleElement.innerText = this.title;
            this.textElement.innerText = this.text;
            app.updateCard(this);
        }

        _deleteCard() {
            app.deleteCard(this);
        }

        _completeCard() {
            this.isDone = this._doneCheckbox.checked;
            app.completeCard(this, true);
            if (this.isDone) {
                this.element.classList.add('card--done');
                this._updateButton.disabled = true;
                this._importanceCheckbox.disabled = true;
            } else {
                this.element.classList.remove('card--done');
                this._updateButton.disabled = false;
                this._importanceCheckbox.disabled = false;
            }
        }

        _createElement() {
            let cardElement = createElement({ classes: ['card'] });
            this.titleElement = createElement({
                tagName: 'h5',
                classes: ['card-title'],
                textContent: this.title,
            });
            this.textElement = createElement({
                tagName: 'p',
                classes: ['card-text'],
                textContent: this.text
            });

            let controlsContainer = createElement({ classes: ['controls-container'] });
            this._updateButton = createElement({
                tagName: 'button',
                textContent: 'Update card',
                classes: ['btn', 'btn-primary']
            });
            this._deleteButton = createElement({
                tagName: 'button',
                textContent: 'Delete card',
                classes: ['btn', 'btn-primary']
            });
            this._importanceCheckbox = createElement({
                tagName: 'input',
                classes: ['form-check-input'],
                attributes: { type: 'checkbox', id: 'importanceCheckbox' }
            });
            if (this.isImportance) {
                this._importanceCheckbox.setAttribute('checked', 'checked');
                cardElement.classList.add('card--importance');
            }
            let importanceCheckboxLabel = createElement({
                tagName: 'label',
                classes: ['form-check-label'],
                attributes: { for: 'importanceCheckbox' },
                textContent: 'Important'
            });

            this._doneCheckbox = createElement({
                tagName: 'input',
                classes: ['form-check-input'],
                attributes: { type: 'checkbox', id: 'doneCheckbox' }
            });

            if (this.isDone) {
                this._doneCheckbox.setAttribute('checked', 'checked');
                cardElement.classList.remove('card--importance');
                cardElement.classList.add('card--done');
                this._updateButton.disabled = true;
                this._importanceCheckbox.disabled = true;
            }

            let doneCheckboxLabel = createElement({
                tagName: 'label',
                classes: ['form-check-label'],
                attributes: { for: 'doneCheckbox' },
                textContent: 'Done'
            });

            controlsContainer.append(
                this._updateButton,
                this._deleteButton,
                this._importanceCheckbox,
                importanceCheckboxLabel,
                this._doneCheckbox, doneCheckboxLabel);

            cardElement.append(this.titleElement, this.textElement, controlsContainer);

            return cardElement;
        }
    }

    let app = new App();

}());