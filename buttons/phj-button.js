class Button extends ComponentLogics {
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
    div{
        background-color: #454a47;
        border: 2px solid #20221d;
        padding: 6px;
        border-radius: 5px;
        color: aliceblue;
        margin: 2px;
        width: fit-content;
    } 
    div:hover{
        cursor:pointer;
    } 
    :host{
        display: inline-block;
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
    div{
        background-color: #616b65;
        border: 2px solid #6f776c;
        padding: 6px;
        border-radius: 5px;
        color: aliceblue;
        margin: 2px;
        width: fit-content;
    }  
    div:hover{
        cursor:not-allowed;
    } 
    :host{
        display: inline-block;
    }                                
</style>
`
            }
        }

        this._state = {
            text: '',
        }
    }

    connectedCallback() {
        // set css of the webcomponent
        this._setLayoutState('enabled')
        // set HTML of the webcomponent
        this._setShadow(`
        <div id="text">
            <slot></slot>
        </div>
        `)
        // set innerhtml
        this._executeShadow()
        // set eventHandlers and handle attributes
        this._setUpAttributes('click', 'icon', 'text','update','delete','create','get','getAll')
    }
}

customElements.define('phj-button', Button)
