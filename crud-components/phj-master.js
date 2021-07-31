class PhjMaster extends ComponentLogics{

    constructor() {
        super();
        // setting basic values

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
        // get all data to feel the master table with
        if(this.hasAttribute('path')){
            this._path = this.getAttribute('path')
        }
        /*        const content = this._getFirstParent('phj-content')
                if(content){
                    this._baseUrl = content._baseUrl
                }*/
        this._url = this._baseUrl + this._path
        console.log(this._url)
        this._getAll().then(res=>{
            console.log(res)
        }).catch(err=>{
            console.log(err)
        })

        // set css of the webcomponent
        this._setLayoutState('default')
        // create the table with the data in it
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

customElements.define('phj-master',PhjMaster)
