class PhjMessage extends ComponentLogics {

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
            },
            error: {
                layoutState: {
                    error: true
                },
                css: `
<style>
  p{
  color:red;
  }                              
</style>
`
            },
            info: {
                layoutState: {
                    info: true
                },
                css: `
<style>
  p{
  color:darkslateblue;
  }                              
</style>
`
            },
            success: {
                layoutState: {
                    success: true
                },
                css: `
<style>
  p{
  color:darkgreen;
  }                              
</style>
`
            }
        }

        this._state = {
            title: '',
            type: ''
        }
    }

    async connectedCallback() {
        // set css of the webcomponent
        this._setLayoutState('visible')
        // set HTML of the webcomponent
        this._setShadow(`
  <p>
            <slot></slot>
</p>
        `)
        // set innerhtml
        this._executeShadow()
        // todo find out why the component is rendered as invisible
        // set eventHandlers and handle attributes
        await this._setUpAttributes('custom-styles', 'events','type')
        // todo fix bug: load event doesn't take place
        this._events.forEach(el => {
            if (el.eventName==='load' && el.actions.length > 0) {
                const loadEvent = new Event('component-loaded')
                this.dispatchEvent(loadEvent)
            }
        })
    }
}

customElements.define('phj-message', PhjMessage)
