class PhjTable extends ComponentLogics {

    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        // todo : zorg ervoor dat een cell-header niet kleiner kan worden dan de breedte van de cell in dezelfde kolom
        this._layoutStates = {
            default: {
                layoutState: {
                    default: true
                },
                css:
                    `
    <style>
       #container{
            display: grid;
            border:3px solid red;
            height: 20vh;
       }
       #head{
            background-color: green;
            display: flex;
            justify-content: space-between;
       }
       #body{
            background-color: blue;
            display: grid;
       }
       .row{
       display: flex;
       }    
       .header-cell{
       border:2px solid #2d2d04;
       width: 100%;
                     display: flex;
                     align-items: center;
                     justify-content: center;
       }
       .cell{
              border:1px solid yellow;
                     width: 100%;
                     display: flex;
                     align-items: center;
                     justify-content: center;
       }                          
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
        if (this.hasAttribute('actions')) {
            this._state.has_actions = true
        }
        // get all data to feel the master table with
        if (this.hasAttribute('path') && this.getAttribute('path').substr(0, 3) === 'get') {
            this._path = this.getAttribute('path').substring(4)
        } else if (this.hasAttribute('url') && this.getAttribute('url').substr(0, 3) === 'get') {
            this._url = this.getAttribute('url').substring(4)
        }
        if (!this.hasAttribute('url')) {
            const content = this._getFirstParent('phj-content')
            if (content) {
                this._baseUrl = content._baseUrl
            }
            this._url = this._baseUrl + this._path
        }
        this._getAll().then(data => {
            console.log('hi', data)
            // data format: { listOfObjects:[{}], numberOfObjects:number, listOfProperties:[string], numberOfProperties:number, modelName:string}
            // als het een samengesteld model is, dan wordt hetzelfde format binnen herbruikt
            let head = '<div id="container"><div id="head">'
            for (let j = 0; j < data.numberOfProperties; j++) {
                head += `<div class="header-cell">${data.listOfProperties[j]}</div>`
            }
            head += '</div>'
            let body = '<div id="body">'
            for (let i = 0; i < data.numberOfObjects; i++) {
                let row = `<div class="row">`
                for (let j = 0; j < data.numberOfProperties; j++) {
                    row += `<div class="cell">${Object.values(data.listOfObjects[i])[j]}</div>`
                }
                row += `</div>`
                body += row
            }
            body += '</div></div>'
            this._setShadow(
                `<div>${head}${body}</div>`
            )
            this._executeShadow()
            this._setUpAttributes('url', 'path', 'actions')
        })
    }

}

customElements.define('phj-table', PhjTable)
