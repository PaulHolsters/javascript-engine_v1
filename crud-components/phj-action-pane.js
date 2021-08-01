class PhjActionPane extends ComponentLogics {

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

        }

    }

    connectedCallback() {
        // set css of the webcomponent
        this._setLayoutState('default')
        // create the table with the data in it
        // todo : work the structure out of this template
        this._setShadow(`
        <div>actionpane</div>
        `)
        // set innerhtml (could be seen as a render method maybe?)
        this._executeShadow()
        // notify other interested components that this component is created
        const actionPaneReady = new CustomEvent('action-pane-created',{bubbles:true,detail:{component:this}})
        const target = this._getFirstParent('phj-crud-template')
        target.addEventListener('action-pane-created', target._processEvent, false)
        target.dispatchEvent(actionPaneReady)
        // set eventHandlers and handle attributes
        //this._setUpAttributes('path','title')
    }
}

customElements.define('phj-action-pane', PhjActionPane)
