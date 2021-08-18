class PhjTitle extends ComponentLogics{

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
   :host{
   
   }
   :host > phj-box{
   
   }
   :host > phj-box > phj-text{
   
   }                
</style>
`
            }
        }

        this._state = {
            title: ''
        }
    }

    connectedCallback() {
        // set css of the webcomponent
        this._setLayoutState('default')
        // the slotted content-elements can be used for a button
        this._setShadow(`
        <phj-box>
            <phj-text></phj-text><slot></slot>
        </phj-box>
        `)
        // set innerhtml
        this._executeShadow()
        // set eventHandlers and handle attributes
        this._setUpAttributes('title','custom-styles','events','connect')
    }
}

customElements.define('phj-title',PhjTitle)
