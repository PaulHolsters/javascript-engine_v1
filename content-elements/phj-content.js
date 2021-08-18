class PhjContent extends ComponentLogics {

    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        // todo what states this component can be in: none as far as I can tell
        this._layoutStates = {
            default: {
                layoutState: {
                    default: true
                },
                css:
                    `
    <style>
                                     
    </style>
`
            }
        }

        this._state = {
            // contains only data for computation

        }


    }

    connectedCallback() {
        // get all data to feel the master table with
        if (this.hasAttribute('baseUrl')) {
            this._baseUrl = this.getAttribute('baseUrl')
            console.log(this._baseUrl)
        }
        // set css of the webcomponent
        this._setLayoutState('default')
        // create the table with the data in it
        this._setShadow(`
        <div>
            <slot></slot>
        </div>
        `)
        // set innerhtml (could be seen as a render method maybe?)
        this._executeShadow()
        // set eventHandlers and handle attributes
        this._setUpAttributes('baseUrl','events')
        // during the setup of the url attribute the restCall should be made
        // the innerHTML of the component should be re-rendered according to the response
    }
}

customElements.define('phj-content', PhjContent)
