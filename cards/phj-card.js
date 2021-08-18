class PhjCard extends ComponentLogics {

    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this._layoutStates = {
            default: {
                layoutState: {
                    default: true
                },
                css: `
<style>
    :host > div{
        background-color: #ddf3f2;
        border: 2px solid #104264;
        padding: 0;
        border-radius: 10px;
        margin: 2px auto;
        max-width: 50%;
        width: fit-content;
    } 
    div > div:first-of-type{
        margin: 0 0 10px; background-color: #48b062; color:white; text-align: center;border-top-left-radius: 10px;
        border-top-right-radius: 10px; padding-top:5px;padding-bottom: 5px;
        font-size: 1.2rem;
    }  
    div > div:nth-of-type(2){
        text-align: left;
        padding: 10px;
        overflow: auto;
    }                              
</style>
`
            }
        }

        this._state = {
            value: '',
            fetch: '',
            data: []
        }
    }

    connectedCallback() {
        // set css of the webcomponent
        this._setLayoutState('default')
        // set HTML of the webcomponent
        this._setShadow(`
        <div>
            <div>Titel</div>
            <div><slot></slot></div>
        </div>
        `)
        // set innerhtml
        this._executeShadow()
        // set eventHandlers and handle attributes
        this._setUpAttributes('value','events')
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value' && newValue.length > 0) {
            this._getOne(Number(newValue.trim())).then(data => {
                const keys = Object.keys(data)
                const values = Object.values(data)
                // set the title
                if (this.hasAttribute('column')) {
                    for (let i = 0; i < keys.length; i++) {
                        if (keys[i] === this.getAttribute('column').trim()) {
                            // noinspection JSValidateTypes
                            this.shadowRoot.querySelector('div > div:first-of-type').innerHTML = values[i]
                            break
                        }
                    }
                }
                const children = this.shadowRoot.querySelector('div > div:nth-of-type(2) > slot').assignedNodes()
                for (let j = 0;j<children.length;j++){
                    if(children[j].nodeType === 1 && children[j].hasAttribute('column')){
                        for (let i = 0; i < keys.length; i++) {
                            if (keys[i] === children[j].getAttribute('column').trim()) {
                                // noinspection JSValidateTypes
                                children[j]._setState('text',values[i])
                                break
                            }
                        }
                    }
                }
            }).catch()
        }
    }

    static get observedAttributes() {
        return ['value']
    }
}

customElements.define('phj-card', PhjCard)
