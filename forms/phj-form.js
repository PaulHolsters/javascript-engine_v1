class PhjForm extends ComponentLogics {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this._layoutStates = {
            enabled: {
                layoutState: {
                    disabled: false
                },
                css: `
<style>
    :host>div{
        background-color: brown;
    }                                
</style>
`
            },
            visible: {
                layoutState: {
                    disabled: false
                },
                css: `
<style>
    :host>div{
        background-color: brown;
    }                                
</style>
`
            },
            disabled: {
                layoutState: {
                    disabled: true
                },
                css: `
<style>
                            
</style>
`

            },
            invisible: {
                layoutState: {
                    disabled: true
                },
                css: `
<style>
            :host{
                display: none;
            }                
</style>
`

            }
        }

        this._state = {
            text: ''
        }
    }

    async connectedCallback(){
        // set css of the webcomponent
        this._setLayoutState('enabled')
        // set HTML of the webcomponent
        this._setShadow(`
            <div>Form</div>
        `)
        // set innerhtml
        this._executeShadow()
        // set eventHandlers and handle attributes
        if (this.hasAttribute('path') && this.getAttribute('path').substr(0, 3) === 'get') {
            this._path = this.getAttribute('path').substring(4)
        } else if (this.hasAttribute('url') && this.getAttribute('url').substr(0, 3) === 'get') {
            this._url = this.getAttribute('url').substring(4)
        }
        if (!this.hasAttribute('url')) {
            const content = this._getFirstParent('phj-content')
            if (content) {
                this._baseUrl = content._baseUrl
            }
            this._url = this._baseUrl + this._path
        }
        await this._setUpAttributes('events','value','url')
        this._events.forEach(el => {
            if (el.hasOwnProperty('load') && el.load.length > 0) {
                const loadEvent = new Event('component-loaded')
                this.dispatchEvent(loadEvent)
            }
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value' && newValue.length > 0) {
            this._getOne(newValue.trim()).then(data => {
                console.log(data)
                // todo refactor specifications/id API
                // todo process data => how?!
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
customElements.define('phj-form',PhjForm)
