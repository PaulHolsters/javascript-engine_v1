class PhjBox extends ComponentLogics {

    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this._layoutStates = {
            visible: {
                layoutState: {
                    visible: true
                },
                css: `
<style>
  :host > div{

  }                               
</style>
`
            },
            invisible: {
                layoutState: {
                    visible: false
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
            title: ''
        }
    }

    async connectedCallback() {
        // set css of the webcomponent
        this._setLayoutState('visible')
        // set HTML of the webcomponent
        this._setShadow(`
        <div>
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
        await this._setUpAttributes('custom-styles', 'events')
        // todo fix bug: load event doesn't take place
        this._events.forEach(el => {
            if (el.eventName==='load' && el.actions.length > 0) {
                const loadEvent = new Event('component-loaded')
                this.dispatchEvent(loadEvent)
            }
        })
    }
}

customElements.define('phj-box', PhjBox)
