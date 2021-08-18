class PhjMaster extends ComponentLogics {

    constructor() {
        super();
        this.addEventListener('action-pane-created', this._buildTable, false);
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
            detail_active: false,
            has_actions: false,// when true the table has an additional actions-column for crud operations
            // and if configured through its attributes also a create button in the title-bar
            actions_active: false,
            has_create: false,
            has_read: false,
            has_update: false,
            has_delete: false,
            create_active: false,
            read_active: false,
            update_active: false,
            delete_active: false,
            title:''
        }

    }

    _buildTable(){
        this._state.has_actions = true
        // get all data to feel the master table with
        if (this.hasAttribute('path') && this.getAttribute('path').substr(0, 3) === 'get') {
            this._path = this.getAttribute('path').substring(4)
        }
        const content = this._getFirstParent('phj-content')
        if (content) {
            this._baseUrl = content._baseUrl
        }
        this._url = this._baseUrl + this._path
        // todo let columns be created by counting the number of properties of the data object because this is not reusable
        this._getAll().then(data=>{
            let title = `<div>${this._state.title}</div>`
            let body = '<div>'
            for (let i = -1;i<data.length;i++){
                if(i!==-1){
                    body += `<div><div>${data[i].specification}</div><div>${data[i].type}</div><div>${data[i].price}</div></div>`
                    if(this._state.has_actions){
                        // todo is het het icon of zijn het buttons?
                        body += `<div>...</div>`
                    }
                } else{
                    // head
                    body += `<div><div></div><div></div><div></div></div>`
                    if(this._state.has_actions){
                        // todo is het het icon of zijn het buttons?
                        body += `<div></div>`
                    }
                }

            }
            body+='</div>'
            // todo inject table into master
            this._setLayoutState('default')
            // create the table with the data in it
            this._setShadow(title+body)

            // set innerhtml (could be seen as a render method maybe?)
            this._executeShadow()

        }).catch()
    }

    connectedCallback() {
        // check whether the table of this component needs an actions-column at the end
        const crudTemplate = this._getFirstParent('phj-crud-template')
        if (crudTemplate) {
            const slottedContent = crudTemplate.shadowRoot.querySelectorAll('div > slot')
            for (let i = 0;i<slottedContent.length;i++){
                if(slottedContent[i].hasAttribute('name') && slottedContent[i].getAttribute('name')==='action-pane'){
                    if(!crudTemplate._isAvailable('phj-action-pane')){
                        crudTemplate._registerListener(this,'phj-action-pane')
                        console.log('registered: ',this,'phj-action-pane')
                        // set eventHandlers and handle attributes
                        this._setUpAttributes('path','title','events')
                        // when the action-pane is created the built of the component will be continue

                    }
                }
            }
        }
    }
}

customElements.define('phj-master', PhjMaster)
