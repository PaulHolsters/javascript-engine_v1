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
        await this._setUpAttributes('events')
        this._events.forEach(el => {
            if (el.hasOwnProperty('load') && el.load.length > 0) {
                const loadEvent = new Event('component-loaded')
                this.dispatchEvent(loadEvent)
            }
        })
    }
}
customElements.define('phj-form',PhjForm)
