class PhjText extends ComponentLogics{

    constructor() {
        super();
        // setting basic values
        if(this.hasAttribute('path')){
            this._path = this.getAttribute('path')
        }
        this._baseUrl = this._getFirstParent('phj-content')._baseUrl
        this._url = this._baseUrl + this._path
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
            row_selected: false,
            number_of_row_selected: null,
            id_selected: null,
            full_length: true,
            menu_open: false,
            number_of_visible_columns: null,
            column_width: 'fixed',
            number_of_visible_rows: null,
            row_height: 'fixed',
            scroll_X: false,
            scroll_Y: false,
            crud_active: false,
            has_detail: false,
            detail_active: false
        }


    }

    connectedCallback() {
        // set css of the webcomponent
        this._setLayoutState('default')
        // before anything else the data should be gathered from the backend
        this.
        this._setShadow(`
        
        `)
        // set innerhtml (could be seen as a render method maybe?)
        this._executeShadow()
        // set eventHandlers and handle attributes
        this._setUpAttributes('url','actions','title')
        // during the setup of the url attribute the restCall should be made
        // the innerHTML of the component should be re-rendered according to the response
    }
}

customElements.define('phj-text',PhjText)
