class Button extends ComponentLogics {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        // todo: implement these customStyles => when there is no specification the algorithm will assume it alters all available layoutStates
        //  *********************************************************************************************************************************
        //  border:0;
        //  background:none;
        //  hover-background:dark-gray;
        //  color:black;
        //  hover-color:white
        // get a list of all states of the component
        // change the states by accessing the _layoutStates property
        // example:
        // this._layoutStates.enabled.css = ALTER THE CSS STRING and then execute the state?
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
        width: max-content;
    } 
    slot{
    display: inline-block;
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
            visible: {
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
        width: max-content;
    } 
        slot{
    display: inline-block;
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
        width: max-content;
    }  
    div:hover{
        cursor:not-allowed;
    } 
        slot{
    display: inline-block;
    }
    :host{
        display: inline-block;
    }                                
</style>
`
            },
            invisible: {
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
        width: max-content;
    } 
        slot{
    display: inline-block;
    } 
    div:hover{
        cursor:not-allowed;
    } 
    :host{
        display: none;
    }                                
</style>
`
            }
        }

        this._state = {
            text: '',
            value:'',
            hasAction: false,
            action: ''
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
        if (!this.hasAttribute('tabindex')) {
            // Choose one of the following lines (but not both):
            this.setAttribute('tabindex', '0');
        }
        this._setUpAttributes('icon', 'text','custom-styles','events','value')
    }
}

customElements.define('phj-button', Button)
