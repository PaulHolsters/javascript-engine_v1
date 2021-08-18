class PhjTextInput extends ComponentLogics {
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
        border: 2px solid #284260;
        padding: 6px;
        border-radius: 5px;
        margin: 2px;
        width: 80%;
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
        border: 1px solid #525456;
        padding: 6px;
        border-radius: 5px;
        margin: 2px;
        width: 80%;
        color: #a7a2a2;
    }
    input:hover{
        cursor: not-allowed;
    }                                
</style>
`

            }
        }

        this._state = {
            text: ''
        }
    }

    connectedCallback(){
        // set css of the webcomponent
        this._setLayoutState('enabled')
        // set HTML of the webcomponent
        this._setShadow(`
        <div id="text" style="display: none"><slot></slot></div>
        <input type="text" id="text2">
        `)
        // set innerhtml
        this._executeShadow()
        // set eventHandlers and handle attributes
        this._setUpAttributes('text','events','connect')
    }
}
customElements.define('phj-text-input',PhjTextInput)
