class ComponentLogics extends HTMLElement {

    _possibleLayoutStates = ['disabled', 'enabled', 'displayed', 'hidden', 'visible', 'invisible', 'selected', 'deselected']
    _layoutStates
    _currentLayoutState

    _html
    _css

    _actions
    _state

    // the baseUrl variable should be used by the phj-content-elements component, everything inside that component can be considered
    // being part of that baseUrl
    // however its possible to not use a baseurl and just go for a complete url structure
    _baseUrl = ''
    _path = ''
    _url = ''
    _availableChildComponents = []
    _registeredListeners = []

    _getFirstParent(elementType) {
        let parent = this.parentElement
        while (parent !== null && parent.tagName !== elementType.toUpperCase()) {
            parent = parent.parentElement
        }
        return parent
    }

    _processEvent(event) {
        switch (event.type) {
            case 'action-pane-created':
                if (this.tagName.toLowerCase() === 'phj-crud-template' && Object.is(event.detail.component._getFirstParent('phj-crud-template'), this)) {
                    this._availableChildComponents.push(event.detail.component)
                    for (let i = 0; i < this._registeredListeners.length; i++) {
                        if (this._registeredListeners[i].component === event.detail.component.tagName
                            && Object.is(this._registeredListeners[i].listener._getFirstParent('phj-crud-template'), this)) {
                            const newEvent = new Event('action-pane-created')
                            this._registeredListeners[i].listener.addEventListener('action-pane-created', this._registeredListeners[i].listener._buildTable)
                            this._registeredListeners[i].listener.dispatchEvent(newEvent)
                        }
                    }
                }
                break
            default:
                console.log('error',event.type)
        }
    }

    _registerListener(listener, elementType) {
        this._registeredListeners.push({listener: listener, component: elementType.toUpperCase()})
    }

    _setLayoutState(state) {
        // every layout is connected to a certain state of the component
        // for a button for example it can be in a disabled or a enabled state
        // this means that there is css for both states => it is important to understand
        // that every state has it's own css; different states for now do not share styles!
        // technically if a component has no state it will not have any styling either
        // the css is stored in a variable _css => this variable is used in the next method
        // executeLayoutState(state) to actually insert the css into the component
        // todo create a way to share css in the case you want a custom style for whatever reason
        // a start could be to create a state which is "custom" and create a function that makes it possible
        // to join custom styles with existing layout States since a custom style should override the state
        // because custom css is not intertwined with any particular state of the component
        // for now every component is in exactly one state and one state only:
        // that is because there is no need for joined css to make sure every possible state can be created
        // for a custom style that luxury is gone.
        // a custom style basically means that part of the stateLayout of possibly every STATE the component
        // can be in, can change => a construction to partially change a layoutState would be the solution of
        // our problem; for now let's assume that a custom style cannot be revoked once it's active
        /**
         * custom-styles="enabled[border:0;background:none;hover-background:dark-gray;color:black;hover-color:white]"
         *
         */
        this._currentLayoutState = state
        this._css = this._layoutStates[state].css
    }

    _restructureCssString(cssStr){
        const cssState = []
        // purifying the string
        cssStr = cssStr.replace('<style>','').replace('</style>','').replace(' ','')
        // separating selectors from their bodies
        let cssArr = cssStr.split('{')
        let tempArr = []
        for(let j=0;j<cssArr.length;j++){
            tempArr.concat(cssArr[j].split('}'))
        }
        cssArr = tempArr
        let objTemp = {}
        let keyTemp = ''
        for(let j=0;j<cssArr.length;j++){
            if(j%2===0){
                // selector
                keyTemp = cssArr[j]
                objTemp[keyTemp] = []
            } else{
                // body
                const valueObjects = []
                const cssValues = cssArr[j].split(';')
                for (let k=0;k<cssValues.length;k++){
                    const obj = {}
                    const key = cssValues[k].split(':')[0]
                    obj[key]= cssValues[k].split(':')[1]
                    valueObjects.push(obj)
                }
                objTemp[keyTemp] = valueObjects
                cssState.push(objTemp)
                objTemp = {}
                keyTemp = ''
            }
        }
        return cssState
    }

    _addCustomStyles(customStyles){
        if(customStyles.split('[').length>1){
            // in this case the customStyles target a specific layoutState

        } else{
            // the customStyles have to be applied to every possible layoutState of the component
            // the styles just have to be added in the end of every css string
            //EXAMPLE of A custom style string =>  div{border:none;background:none;color:black}div:hover{background-color:dark-gray;color:white}
            for (let i=0;i<Object.keys(this._layoutStates).length;i++){
                // datastructure cssState: [{selector:[{cssProp:cssval}]}]
                let cssStr = this._layoutStates[Object.keys(this._layoutStates)[i].toString()].css
                cssStr = cssStr.replace('<style>','').replace('</style>','').replace(' ','').replace('\n','').replace('\t','').toString().trim()
                customStyles = customStyles.replace(' ','').replace('\n','').replace('\t','').toString().trim()
                // separate different selectors
                let currentBody = cssStr.substring(0,cssStr.search('}')).toString().trim()
                let currentSelector = cssStr.substring(0,cssStr.search('{')).toString().trim()
                let nextStart = cssStr.search('}')+1

                // todo repeat this for every css-selector in cssStr:
                //  per selector en in die volgorde ga je na of er een selector in customstyles zit
                //  indien ja dan doe je onderstaand algoritme om de body horende bij de selector te wijzigen
                //   indien nee dan ga je naar de volgende selector
                //    todo: de selectors van de customstyles die niet bestaan in de selectors van de component moeten ook gewoon toegevoegd worden
                // onderstaand proces is getest en werkt
                let index1 = cssStr.indexOf('{')
                let index2 = cssStr.indexOf('}')
                let substring = cssStr.substring(index1+1,index2).toString().trim()
                let selector = cssStr.substring(0,index1)
                let index1Cst = customStyles.indexOf('{')
                let index2Cst = customStyles.indexOf('}')
                let substringCustom = customStyles.substring(index1Cst+1,index2Cst).toString().trim()
                let  selectorCustom = customStyles.substring(0,index1Cst)
                if(selector.toString()===selectorCustom.toString()){
                    let stringTemp = substring
                    let newCssBody = ''
                    while(stringTemp.length>0){
                        const key = stringTemp.substring(0,stringTemp.indexOf(':')).toString().trim()
                        //console.log(substringCustom)
                        if(substringCustom.search(key)!==-1){
                            const startIndex = substringCustom.indexOf(key)
                            //console.log(substringCustom,startIndex)
                            if(substringCustom.indexOf(';',startIndex)===-1){
                                newCssBody+=substringCustom.substr(startIndex)+';'
                            } else{
                                newCssBody+=substringCustom.substring(startIndex,substringCustom.indexOf(';',startIndex)+1)
                            }
                        } else{
                            newCssBody+=stringTemp.substring(0,stringTemp.indexOf(';')+1)
                        }
                        if(stringTemp.indexOf(';')+1>=stringTemp.length){
                            stringTemp = ''
                        } else{
                            stringTemp = stringTemp.substr(stringTemp.indexOf(';')+1)
                        }
                    }
                    // ga elke key af in customstring
                    let keyAvailable = true
                    let startIndex = 0
                    while(keyAvailable){
                        let key = substringCustom.substring(startIndex,substringCustom.indexOf(':',startIndex)).toString().trim()
                        if(newCssBody.toString().trim().search(key+':')===-1){
                            // add the style rule to the new css of the component
                            if(substringCustom.indexOf(';',startIndex)!==-1){
                                startIndex = substringCustom.indexOf(';',startIndex)+1
                                if(startIndex>=substringCustom.length){
                                    keyAvailable = false
                                }
                                newCssBody+=substringCustom.substring(startIndex,substringCustom.indexOf(';',startIndex)).toString().trim()
                            } else{
                                keyAvailable = false
                                newCssBody+=substringCustom.substr(startIndex).toString().trim()
                            }
                        } else{
                            // go the the next custom style rule
                            if(substringCustom.indexOf(';',startIndex)!==-1){
                                startIndex = substringCustom.indexOf(';',startIndex)+1
                                if(startIndex>=substringCustom.length){
                                    keyAvailable = false
                                }
                            } else{
                                keyAvailable = false
                            }
                        }
                    }
                }

                // step 3: create the new css string
/*                this._layoutStates[Object.keys(this._layoutStates)[i].toString()].css =
                    `${this._layoutStates[Object.keys(this._layoutStates)[i].toString()].css.substr(-8)}${customStyles}</style>`*/
            }
        }
    }

    executeLayoutState(state) {
        this._currentLayoutState = state
        this._css = this._layoutStates[state].css
        this.shadowRoot.querySelector('style').remove()
        const el = document.createElement('STYLE')
        el.innerText = this._css.replace('<style>', '').replace('</style>', '')
        this.shadowRoot.insertBefore(el, this.shadowRoot.childNodes[0]);
        if (this.shadowRoot.querySelector('input')) {
            if (state === 'disabled' && !this.shadowRoot.querySelector('input').hasAttribute('disabled')) {
                this.shadowRoot.querySelector('input').setAttribute('disabled', 'true')
            } else if (this.shadowRoot.querySelector('input').hasAttribute('disabled')) {
                this.shadowRoot.querySelector('input').removeAttribute('disabled')
            }
        } else if (this.shadowRoot.querySelector('textarea')) {
            if (state === 'disabled' && !this.shadowRoot.querySelector('textarea').hasAttribute('disabled')) {
                this.shadowRoot.querySelector('textarea').setAttribute('disabled', 'true')
            } else if (this.shadowRoot.querySelector('textarea').hasAttribute('disabled')) {
                this.shadowRoot.querySelector('textarea').removeAttribute('disabled')
            }
        }
    }
    _setShadow(html) {
        this._html = html
    }

    _executeShadow() {
        this.shadowRoot.innerHTML = this._css + this._html
    }

    _getState(property) {
        if (this._state.hasOwnProperty(property)) {
            return this._state[property]
        }
    }

    _setState(property, value) {
        if (this._state.hasOwnProperty(property)) {
            switch (property) {
                case 'value':
                    this._state.value = value
                    this.setAttribute('value', value)
                    break
                case 'text':
                    if (this.shadowRoot.querySelector('input[type="text"]') || this.shadowRoot.querySelector('input[type="number"]')) {
                        this.shadowRoot.querySelector('input').value = value
                        this._state.text = value
                    } else if (this.shadowRoot.querySelector('input[type="radio"]')) {
                        this._state.text = value
                        this.shadowRoot.querySelector('#text').innerHTML = value
                    } else if (this.shadowRoot.querySelector('textarea')) {
                        this.shadowRoot.querySelector('textarea').innerText = value
                        this._state.text = value
                    } else {
                        this.innerText = ''
                        this._state.text = value
                        this.shadowRoot.querySelector('#text > slot').textContent = value
                    }
                    break
                case 'row_selected':
                    break
                case 'number_of_row_selected':
                    break
                case 'id_selected':
                    break
            }
        }
    }

    _setUpAttributes() {
        for (let i = 0; i < arguments.length; i++) {
            switch (arguments[i]) {
                case 'url':
                    if (this.hasAttribute('url')) {
                        this._state.url = this.getAttribute('url')
                    }
                    break
                case 'custom-styles':
                    if (this.hasAttribute('custom-styles')) {
                        this._addCustomStyles(this.getAttribute('custom-styles'))
                        this.executeLayoutState(this._currentLayoutState)
                    }
                    break
                case 'type':

                    break
                case 'actions':
                    if (this.hasAttribute('actions')) {
                        this._state.has_actions = true
                        this._state.actions = this.getAttribute('actions')
                    }
                    break
                case 'title':
                    if (this.hasAttribute('title')) {
                        this._state.title = this.getAttribute('title')
                    }
                    break
                case 'click':
                    if (this.hasAttribute('click')) {
                        this._actions = this.getAttribute('click').split(',')
                        this.addEventListener('click', this._eventHandler)
                    }
                    break;
                case 'load':
                    if (this.hasAttribute('load')) {
                        this._actions = this.getAttribute('load').split(',')
                        this.addEventListener('load', this._eventHandler)
                    }
                    break;
                case 'hover':
                    if (this.hasAttribute('hover')) {
                        this._actions = this.getAttribute('hover').split(',')
                        this.addEventListener('hover', this._eventHandler)
                    }
                    break;
                case 'select':
                    if (this.hasAttribute('select')) {
                        // todo do stuff
                        this.addEventListener('select', this._eventHandler)
                    }
                    break;
                case 'change':
                    if (this.hasAttribute('change')) {
                        // todo do stuff
                        this.addEventListener('change', this._eventHandler)
                    }
                    break;
                case 'check':
                    if (this.hasAttribute('check')) {
                        // todo do stuff
                        this.addEventListener('check', this._eventHandler)
                    }
                    break;
                case 'icon':
                    if (this.hasAttribute('icon')) {
                        const icon = this.getAttribute('icon').split(' ')
                        const el = document.createElement(icon[0])
                        if (icon.length > 1 && icon[1] === 'suffix') {
                            this.shadowRoot.querySelector('div').insertAdjacentElement('beforeend', el);
                        } else {
                            this.shadowRoot.querySelector('div').insertAdjacentElement('afterbegin', el);
                        }
                    }
                    break;
                case 'text':
                    if (this.hasAttribute('text')) {
                        this._state.text = this.getAttribute('text').trim()
                        this.shadowRoot.querySelector('#text').innerHTML = this._state.text
                        if (this.shadowRoot.querySelector('input')) {
                            this.shadowRoot.querySelector('input').value = this._state.text
                        } else if (this.shadowRoot.querySelector('textarea')) {
                            this.shadowRoot.querySelector('textarea').innerText = this._state.text
                        }
                    } else {
                        const slot = this.shadowRoot.querySelector('#text > slot')
                        slot.addEventListener('slotchange', () => {
                            if (slot.assignedNodes()[0]) {
                                this._state.text = slot.assignedNodes()[0].textContent
                                if (this.shadowRoot.querySelector('input[type="text"]')
                                    || this.shadowRoot.querySelector('input[type="number"]')) {
                                    this.shadowRoot.querySelector('input').value = this._state.text
                                } else if (this.shadowRoot.querySelector('textarea')) {
                                    this.shadowRoot.querySelector('textarea').innerText = this._state.text
                                }
                            }
                        })
                    }
                    break;
                case 'value':
                    if (this.hasAttribute('value')) {
                        this._state.value = this.getAttribute('value').trim()
                    }
                    break;
            }
        }
    }

    async _getOne(id) {
        const url = this._baseUrl + '/' + this._table + '.php' + '?id=' + id
        return await fetch(url).then(
            res => {
                return res.json()
            }
        ).then(
            res => {
                return this._responseHandler(res, 'getOne')
            }
        ).catch();
    }

    async _getAll() {
        return await fetch(this._url).then(
            res => {
                return res.json()
            }
        ).then(
            res => {
                return this._responseHandler(res, 'getAll')
            }
        ).catch();
    }

    async _create() {

    }

    async _update() {

    }

    async _delete() {

    }

    _responseHandler(response, verb) {
        switch (verb) {
            case 'getOne':
                return Object.values(response)[1]
            case 'getAll':
                return response
            case 'post':

                break
            case 'put':

                break
            case 'delete':

                break
        }
    }

    _eventHandler(event) {
        switch (event.type) {
            case 'click':
                if (this._currentLayoutState === 'enabled') {
                    // todo: make it possible to use this as a selector
                    for (let i = 0; i < this._actions.length; i++) {
                        // todo make it possible the use an index with your selectors

                        // todo: add CRUD functionality
                        // todo: change the code below since it assumes incorrectly that clicking is all about layout changes
                        // create -> get form info, create a body and send it using the _create method
                        // update -> get form info, create a body and send it using the _update method
                        // delete -> get form info, create a body and send it using the _delete method
                        const selector1 = this._actions[i].split('=>')[0].trim()
                        const elements = document.querySelectorAll(selector1)
                        const value2 = this._actions[i].split('=>')[1].trim()
                        if (this._possibleLayoutStates.includes(value2)) {
                            // change the state of the targeted elements upon the click
                            for (let j = 0; j < elements.length; j++) {
                                elements[j].executeLayoutState(value2)
                            }
                        } else if (elements[0]._getState('text') !== undefined) {
                            // get text of the source (only one source!) and
                            // replace the text of every target if it has a text property
                            // a component can have either a value or a text property, never both!
                            const targets = document.querySelectorAll(value2)
                            for (let j = 0; j < targets.length; j++) {
                                if (targets[j]._getState('text') !== undefined) {
                                    targets[j]._setState('text', elements[0]._getState('text'))
                                }
                            }
                        } else if (elements[0]._getState('value') !== undefined) {
                            // get value of the source (only one source!) and
                            // replace the value of every target if it has that property
                            const targets = document.querySelectorAll(value2)
                            for (let j = 0; j < targets.length; j++) {
                                if (targets[j]._getState('value') !== undefined) {
                                    // copying the value property-value from the source to the targets, if it has such a property
                                    targets[j]._setState('value', elements[0]._getState('value'))
                                    // after changing the state of this components attribute changed callback will make sure
                                    // a rest call will get the data associated with that value, depending
                                    // whether the component is configured that way which is the case for the card component
                                }
                            }
                        }
                    }
                }
                break;
            case 'load':

                break;
            case 'hover':

                break;
            case 'select':

                break;
            case 'change':

                break;
            case 'check':

                break;
        }
    }


}
