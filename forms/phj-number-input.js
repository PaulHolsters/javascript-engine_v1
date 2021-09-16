class PhjNumberInput extends ComponentLogics {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        // todo when changed the disabled state is not shown but the same enabled css gets replaced by itself
        //   + the input field should get a tag 'disabled'
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
    display: block;
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
            text: '',
            hasLabel: false,
            label: '',
            hasMoney: false,
            money: '',
            showDecimals: 0,
            nullWhenEmpty: true
        }
    }

    connectedCallback(){
        // set css of the webcomponent
        this._setLayoutState('enabled')
        // set HTML of the webcomponent
        this._setShadow(`
        <div id="text" style="display: none"><slot></slot></div>
        <input type="number" id="text2">
        `)
        // set innerhtml
        this._executeShadow()
        // set eventHandlers and handle attributes
        this._setUpAttributes('text','events','label','money','decimals','prop')
    }
}
customElements.define('phj-number-input',PhjNumberInput)
