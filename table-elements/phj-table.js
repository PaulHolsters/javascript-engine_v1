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
            // data format: { listOfObjects:[{}], numberOfObjects:number, listOfProperties:[string], numberOfProperties:number, modelName:string}
            // als het een samengesteld model is, dan wordt hetzelfde format binnen herbruikt
            //console.log(data)
            let head = '<div>'
            for (let j = 0;j<data.numberOfProperties; j++){
                head += `<div>${data.listOfProperties[j]}</div>`
            }
            head += '</div>'
            let body = '<div>'
            for (let i = 0; i < data.numberOfObjects; i++) {
                let row = `<div>`
                for (let j = 0;j<data.numberOfProperties; j++){
                    row += `<div>${Object.values(data.listOfObjects[i])[j]}</div>`
                }
                row += `</div>`
                body+=row
            }
            body +='</div>'
            this._setShadow(
        `<div>${head}${body}</div>`
        )
            this._executeShadow()
            this._setUpAttributes('url', 'path', 'actions')
        })
}

}
customElements.define('phj-table', PhjTable)
