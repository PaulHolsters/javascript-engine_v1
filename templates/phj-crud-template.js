class PhjCrudTemplate extends ComponentLogics {

    constructor() {
        super();
        this.attachShadow({mode: 'open'})
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

        }

    }



    connectedCallback() {
        // set css of the webcomponent
        this._setLayoutState('default')
        // create the table with the data in it
        // todo : work the structure out of this template
        this._setShadow(`
        <div>
            <slot name="master"></slot>
            <slot name="detail"></slot>
            <slot name="action-pane"></slot>
        </div>
        `)
        // set innerhtml (could be seen as a render method maybe?)
        this._executeShadow()
        // set eventHandlers and handle attributes
        //this._setUpAttributes('path','title')
    }
}

customElements.define('phj-crud-template', PhjCrudTemplate)
