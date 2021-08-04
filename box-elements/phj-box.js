class PhjBox extends ComponentLogics{

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

  }                               
</style>
`
            }
        }

        this._state = {
            title: '',
        }
    }

    connectedCallback() {
        // set css of the webcomponent
        this._setLayoutState('default')
        // set HTML of the webcomponent
        this._setShadow(`
        <div>
            <slot></slot>
        </div>
        `)
        // set innerhtml
        this._executeShadow()
        // set eventHandlers and handle attributes
        this._setUpAttributes('custom-styles')
    }
}

customElements.define('phj-box',PhjBox)
