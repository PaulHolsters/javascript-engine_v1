class PhjTextarea extends ComponentLogics {
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
    textarea{
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
    textarea{
        border: 1px solid #525456;
        padding: 6px;
        border-radius: 5px;
        margin: 2px;
        width: 80%;
        color: #a7a2a2;
    }
    textarea:hover{
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
        <textarea id="text2"></textarea>
        `)
        // set innerhtml
        this._executeShadow()
        // set eventHandlers and handle attributes
        this._setUpAttributes('text','events')
    }
}
customElements.define('phj-textarea',PhjTextarea)
