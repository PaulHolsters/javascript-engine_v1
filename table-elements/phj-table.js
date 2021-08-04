class PhjTable extends ComponentLogics {

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
            // contains only data for computation

        }

    }

    connectedCallback() {
        this._setLayoutState('default')
        if(this.hasAttribute('actions')){
            this._state.has_actions = true
        }
        // get all data to feel the master table with
        if (this.hasAttribute('path') && this.getAttribute('path').substr(0, 3) === 'get') {
            this._path = this.getAttribute('path').substring(4)
        }
        const content = this._getFirstParent('phj-content')
        if (content) {
            this._baseUrl = content._baseUrl
        }
        this._url = this._baseUrl + this._path
        this._getAll().then(data=> {
            // data format: {object with array-key:[{data-object}], number-of-data-objects-key:number, keys-key:[{index: key}],values-key:[{index:value}],model-name-key}
            // als het een samengesteld model is, dan wordt hetzelfde format binnen herbruikt
            let container = '<div>'
            let body = '<div>'
            for (let i = 0; i < data.NumberOfDataObjects; i++) {


                    body += `<div><div>${data.listOfObjects[i].specification}</div><div>${data[i].type}</div><div>${data[i].price}</div></div>`
                    if (this._state.has_actions) {
                        // todo is het het icon of zijn het buttons?
                        body += `<div>...</div>`
                    }

            }
            let head = '<div>'
            container += '</div>'
            this._setShadow(
        body
        )
            this._executeShadow()
            this._setUpAttributes('url', 'path', 'actions')
        })
}

}
customElements.define('phj-table', PhjTable)
