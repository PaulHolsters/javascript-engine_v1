class PhjMaster extends ComponentLogics {

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
        }

    }

    connectedCallback() {
        // get all data to feel the master table with
        if (this.hasAttribute('path') && this.getAttribute('path').substr(0, 3) === 'get') {
            this._path = this.getAttribute('path').substring(4)
        }
        const content = this._getFirstParent('phj-content')
        if (content) {
            this._baseUrl = content._baseUrl
        }
        this._url = this._baseUrl + this._path
        // todo do the necessary checks first before calling for data

        this._getAll().then(data => {
            // data consists of an array with the specifications as an object (see docs API) named "specifications"
            // and some extra data needed to construct this component

            // check whether an actions columns is required
            // principle: if there is an action pane there has to be at least one action
            // so first we check if the crud-template has an action pane
            // then we check if the master component has buttons inside it with a read, update or delete attribute
            // if so this component needs an actions column otherwise it doesn't

            /*
            *                         const slot = this.shadowRoot.querySelector('#text > slot')
                        slot.addEventListener('slotchange', () => {
                            if(slot.assignedNodes()[0]){
                                this._state.text = slot.assignedNodes()[0].textContent
            * */
            const content = this._getFirstParent('phj-crud-template')
            if (content) {
                const slottedContent = content.shadowRoot.querySelectorAll('div > slot')
                for (let i = 0;i<slottedContent.length;i++){
                    if(slottedContent[i].hasAttribute('name') && slottedContent[i].getAttribute('name')==='action-pane'){
                        if(!content._isAvailable('phj-action-pane')){
                            // when the action-pane is created the built of the component will be continued
                            content._registerListener(this,'phj-action-pane')
                            data = null
                        }
                    }
                }
            }
            return data
        }).then(
            (data) => {
                let html = ''
                if(data){
                    // build html-string
                    let titleBar = ''
                    let head = ''
                    let body = '<div>'
                    for (let spec in data.specifications){
                        body += `<div>${spec.specification}</div><div>${spec.type}</div><div>${spec.price}</div>`
                        if(this._state.has_actions){
                            // todo is het het icon of zijn het buttons?
                            body += `<div></div>`
                        }
                    }
                    html = head + body
                }
                this._setLayoutState('default')
                // create the table with the data in it
                this._setShadow(html)
                // set innerhtml (could be seen as a render method maybe?)
                this._executeShadow()
                // set eventHandlers and handle attributes
                this._setUpAttributes('path','title')
            }
        ).catch(err => {
            console.log(err)
        })
    }
}

customElements.define('phj-master', PhjMaster)
