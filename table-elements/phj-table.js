class PhjTable extends ComponentLogics {

    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this._layoutStates = {
            enabled: {
                layoutState: {
                    disabled: false
                },
                css:
                    `
    <style>

       #container{
            border:2px solid #1e222b;
            color:whitesmoke;
            margin-right: auto;
            margin-left: auto;
            width: 60vw;
            height:40vh;
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr;
            overflow:auto;
       }
       .header-cell{
 background-color: royalblue;
display: grid;
height: fit-content;
border-bottom: 1px solid black;
border-top: 1px solid black;
border-left:1px solid black;
padding: 10px 5px;
       } 
       .title{
       background-color: #00648b;
       color: whitesmoke;
       display: grid;
       grid-column-start: 1;
       grid-column-end: 5;
       padding: 10px 5px;
       grid-template-columns: 5fr 1fr;
       height: fit-content;
       }
       .header-cell>div{
margin: auto;
       } 
              .header-cell>div>div{
width: max-content;
       } 
 
       .cell{
background-color: #606060;
border-top: 1px solid black;
border-left:1px solid black;
padding-left: 5px;
padding-right: 5px;
display: grid;

       }    
              .cell>div{
margin-top:auto;
margin-bottom:auto;
       } 
                     .cell>div>div{
width: max-content;

       }                        
    </style>
`
            }
        }
// todo pas max-content shit aan voor de actions kolom=>dat moet min-content zijn
        this._state = {
            // contains only data for computation
            has_actions: false,
            actions: '',
            hasTitle: false,
            title: '',
            hasCreateBtn: false,
            createBtn: '',
            targetStr: '',
            value: '',
            data: {},
            selectedRow: -1,
            selectedRowId: ''
        }
    }

    connectedCallback() {
        this._setLayoutState('enabled')
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
        this._setShadow(
            `<slot></slot>`
        )
        this._executeShadow()
        this._getAll().then(data => {
            this._state.data = data
            this._setUpAttributes('url', 'path', 'actions', 'events', 'value', 'title','create','target')
            // data format: { listOfObjects:[{}], numberOfObjects:number, listOfProperties:[string], numberOfProperties:number, modelName:string}
            let container = '<div id="container">'
            let head = ''
            let body = ''
            if (this._state.has_actions) {
                const comboBox = this.shadowRoot.querySelector('slot').assignedNodes()[0].nextElementSibling
                // set up a actions column so the table becomes an interactive one
                for (let j = 0; j <= data.numberOfProperties; j++) {
                    // the extra divs are necessary to make sure that the text inside the cell stays on one line which is the default behavior
                    if (j !== 0 && j % data.numberOfProperties === 0) {
                        head += `<div class="header-cell"><div><div>${this._state.actions}</div></div></div>`
                    } else {
                        head += `<div class="header-cell"><div><div>${data.listOfProperties[j]}</div></div></div>`
                    }
                }
                for (let i = 0; i < data.numberOfObjects; i++) {
                    let row = ``
                    for (let j = 0; j <= data.numberOfProperties; j++) {
                        // the extra divs are necessary to make sure that the text inside the cell stays on one line
                        if (j !== 0 && j % data.numberOfProperties === 0) {
                            row += `<div class="cell"><div>${comboBox.outerHTML}<phj-id value="${Object.values(data.listOfObjects[i])[j].toString().trim()}"></phj-id></div></div>`
                        } else {
                            row += `<div class="cell"><div><div>${Object.values(data.listOfObjects[i])[j]}</div></div></div>`
                        }
                    }
                    body += row
                }
                body += '</div>'
            } else {

                for (let j = 0; j < data.numberOfProperties; j++) {
                    // the extra divs are necessary to make sure that the text inside the cell stays on one line
                    head += `<div class="header-cell"><div><div>${data.listOfProperties[j]}</div></div></div>`
                }
                for (let i = 0; i < data.numberOfObjects; i++) {
                    let row = ``
                    for (let j = 0; j < data.numberOfProperties; j++) {
                        // the extra divs are necessary to make sure that the text inside the cell stays on one line
                        row += `<div class="cell"><div><div>${Object.values(data.listOfObjects[i])[j]}</div></div></div>`
                    }
                    body += row
                }
                body += '</div>'
            }
            let table = ``
            let title = ``
            if (this._state.hasTitle) {
                if (this._state.hasCreateBtn) {
                    title = `<div class="title"><div style="letter-spacing:0.1rem;font-size:1.2rem;display: grid;text-align: center;margin-top: 0.5rem">${this._state.title}</div><phj-button style="display: grid;" icon="phj-create" events="click:${this._state.targetStr}=>visible"
                    custom-styles="div{background:#2b448f;color:white}div:hover{background-color:darkblue;color:white}">${this._state.createBtn}</phj-button></div>`
                } else {
                    title = `<div class="title">${this._state.title}</div>`
                }
                table = `<div>${container}${title}${head}${body}</div>`
            } else {
                table = `<div>${container}${head}${body}</div>`
            }
            this._setShadow(
                `${table}`
            )
            this._executeShadow()
            let columnStr = '1fr'
            for (let i = 1; i < data.numberOfProperties; i++) {
                columnStr += ' 1fr'
            }
            if (this._state.has_actions) {
                columnStr += ' 1fr'
            }
            this.shadowRoot.querySelector('#container').style.gridTemplateColumns = columnStr
            // tableHeight is a string '...px' with no spaces and a float as a number
            let tableHeight = getComputedStyle(this.shadowRoot.querySelector('#container')).getPropertyValue('height')
            tableHeight = Number(tableHeight.substr(0, tableHeight.length - 2))
            let headerHeight = getComputedStyle(this.shadowRoot.querySelector('#container>.header-cell')).getPropertyValue('height')
            headerHeight = Number(headerHeight.substr(0, headerHeight.length - 2))
            // variable declaration
            const numberOfRows = data.numberOfObjects

            const rowHeight = (tableHeight - headerHeight) / numberOfRows
            let rowStr = ''
            for (let i = 0; i < numberOfRows; i++) {
                rowStr += ' 1fr'
            }
            const headerFraction = (headerHeight / rowHeight).toFixed(2) + 'fr'
            if (this._state.hasTitle) {
                rowStr = headerFraction + ' ' + headerFraction + rowStr
            } else {
                rowStr = headerFraction + rowStr
            }
            this.shadowRoot.querySelector('#container').style.gridTemplateRows = rowStr

            // additional styling
            const divs = this.shadowRoot.querySelectorAll('#container > .cell')
            let rowCount = 0
            if (this._state.has_actions) {
                for (let i = 0; i < divs.length; i++) {
                    // math.floor geeft het rijnummer dat begint bij 0
                    // implements alternating rows and actions-column
                    if ((i + 1) % (data.numberOfProperties + 1) === 0) {
                        rowCount++
                        // actions-column
                        divs[i].style.backgroundColor = 'white'
                        divs[i].style.color = 'black'
                    } else if (rowCount % 2 === 1) {
                        divs[i].style.backgroundColor = 'lightgray'
                        divs[i].style.color = 'black'
                    }
                    // close the right border of each row
                    if ((i + 1) % (data.numberOfProperties + 1) === 0) {
                        divs[i].style.borderRight = '1px solid black'
                    }
                    // close the bottom border of the last row
                    if (Math.floor(i / (data.numberOfProperties + 1)) + 1 === numberOfRows) {
                        divs[i].style.borderBottom = '1px solid black'
                    }
                }
            } else {
                for (let i = 0; i < divs.length; i++) {
                    // math.floor geeft het rijnummer dat begint bij 0
                    // implements alternating rows
                    if (Math.floor(i / data.numberOfProperties) % 2 === 1) {
                        divs[i].style.backgroundColor = 'lightgray'
                        divs[i].style.color = 'black'
                    }
                    // close the right border of each row
                    if (i % data.numberOfProperties === data.numberOfProperties - 1) {
                        divs[i].style.borderRight = '1px solid black'
                    }
                    // close the bottom border of the last row
                    if (Math.floor(i / data.numberOfProperties) + 1 === numberOfRows) {
                        divs[i].style.borderBottom = '1px solid black'
                    }
                }
            }
            // close the right border of the header
            this.shadowRoot.querySelector('#container > div:nth-child(' + (data.numberOfProperties + 1) + ')').style.borderRight = '1px solid black'
        })
    }

    _removeData(nop) {
        let row = 1
        let count = 1
        this.shadowRoot.querySelectorAll('.cell > div').forEach(element => {
            if (count !== (nop + 1) * row) {
                element.innerHTML = ''
            } else {
                row++
            }
            count++
        })
    }

    _insertData(data) {
        let row = 1
        let count = 1
        let col = 0
        this.shadowRoot.querySelectorAll('.cell > div').forEach(element => {
            if (count !== (data.numberOfProperties + 1) * row) {
                if (Object.values(data.listOfObjects[row - 1])[col]) {
                    element.innerHTML = Object.values(data.listOfObjects[row - 1])[col].toString()
                } else {
                    element.innerHTML = ''
                }
                col++
            } else {
                row++
                col = 0
            }
            count++
        })
        this._state.data = data
    }

    _addRows(numberOfRows) {

    }

    _removeRows(numberOfRows) {

    }

    _rebuild() {
        this._getAll().then(data => {
            this._removeData(data.numberOfProperties)
            if (data.numberOfObjects > this._state.data.numberOfObjects) {
                this._addRows(data.numberOfObjects - this._state.data.numberOfObjects)
            } else if (data.numberOfObjects < this._state.data.numberOfObjects) {
                this._removeRows(Math.abs(data.numberOfObjects - this._state.data.numberOfObjects))
            }
            this._insertData(data)
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value' && newValue === 'true') {
            this._noEvent = true
        }
    }

    static get observedAttributes() {
        return ['value']
    }
}

customElements.define('phj-table', PhjTable)
