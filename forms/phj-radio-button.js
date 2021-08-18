class PhjRadioButton extends ComponentLogics {
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
    input{

    }
    :host{

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
    input{

    }
    input:hover{
        cursor: not-allowed;
    }                                
</style>
`

            }
        }

        this._state = {
            text: '',
            value: '',
            selected: false
        }
    }

    connectedCallback(){
        // set css of the webcomponent
        this._setLayoutState('enabled')
        // set HTML of the webcomponent
        this._setShadow(`
        <input type="radio"><div id="text" style="display: inline"><slot></slot></div>
        `)
        // set innerhtml
        this._executeShadow()
        // set eventHandlers and handle attributes
        this._setUpAttributes('text','value','selected','events','connect')
    }
}
customElements.define('phj-radio-button',PhjRadioButton)
