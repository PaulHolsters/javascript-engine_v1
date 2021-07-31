class PhjId extends ComponentLogics{
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this._state = {
            value: ''
        }
    }

    connectedCallback() {
        // set eventHandlers and handle attributes
        this._setUpAttributes('value')
    }

}

customElements.define('phj-id',PhjId)
