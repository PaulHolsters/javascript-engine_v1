class ComponentLogics extends HTMLElement {

    _possibleLayoutStates = ['disabled', 'enabled', 'displayed', 'hidden', 'visible', 'invisible', 'selected', 'deselected']
    _layoutStates
    _currentLayoutState

    _html
    _css

    _events = [{click:[]},{hover:[]},{hoverAway:[]},{change:[]},{select:[]},{load:[]},{check:[]}]
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
                console.log('error', event.type)
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

    _restructureCssString(cssStr) {
        // return-value: {selector:[{cssRule:value}]}
        const cssState = []
        // purifying the string
        cssStr = cssStr.replace('<style>', '').replace('</style>', '').replace(' ', '')
        // separating selectors from their bodies
        let cssArr = cssStr.split('{')
        let tempArr = []
        for (let j = 0; j < cssArr.length; j++) {
            tempArr.concat(cssArr[j].split('}'))
        }
        cssArr = tempArr
        let objTemp = {}
        let keyTemp = ''
        for (let j = 0; j < cssArr.length; j++) {
            if (j % 2 === 0) {
                // selector
                keyTemp = cssArr[j]
                objTemp[keyTemp] = []
            } else {
                // body
                const valueObjects = []
                const cssValues = cssArr[j].split(';')
                for (let k = 0; k < cssValues.length; k++) {
                    const obj = {}
                    const key = cssValues[k].split(':')[0]
                    obj[key] = cssValues[k].split(':')[1]
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

    _addCustomStyles(customStyles) {
        const overrideCss = function (originalRules, newRules) {
            // function returns a new cssString that contains the old css rules with their values
            // if the rules where not inside the correct selector in customRules
            // and contains the old rules with new values if these rules where found in the
            // correct selector of customRules and new rules that were found in the correct selector of customRules
            // which were not found in the originalRules
            let substring = originalRules.toString().trim()
            let substringCustom = newRules.toString().trim()
            let stringTemp = substring
            let newCssBody = ''
            while (stringTemp.length > 0) {
                // we gaan elke css regel af in de orginele body en zien of er ene is in custom css die moet overriden
                const key = stringTemp.substring(0, stringTemp.indexOf(':')).toString().trim()
                if (substringCustom.search(key) !== -1) {
                    // custom css bepaalt nu de regel
                    const startIndex = substringCustom.indexOf(key)
                    if (substringCustom.indexOf(';', startIndex) === -1) {
                        newCssBody += substringCustom.substr(startIndex) + ';'
                    } else {
                        newCssBody += substringCustom.substring(startIndex, substringCustom.indexOf(';', startIndex) + 1)
                    }
                } else {
                    // the same css rule is not in the custom ones
                    newCssBody += stringTemp.substring(0, stringTemp.indexOf(';') + 1)
                }
                // determine whether the loop has to end or not by cutting a piece from stringTemp that has already been processed
                if (stringTemp.indexOf(';') + 1 >= stringTemp.length || stringTemp.indexOf(';')===-1 ) {
                    stringTemp = ''
                } else {
                    stringTemp = stringTemp.substr(stringTemp.indexOf(';') + 1)
                }
            }

            // op dit punt zijn alle regels die ook in de custom styles zijn, overgenomen en diegene die niet in customstyles zijn
            // zijn gebleven
            // nu gaan we diegene die in customstyles staan maar niet in de originele er ook bijzetten
            let keyAvailable = true
            // we gaan nu over de customstyle string vanaf 0 tot het einde
            let startIndex = 0
            while (keyAvailable) {
                let key = substringCustom.substring(startIndex, substringCustom.indexOf(':', startIndex)).toString().trim()
                // bug : color: is a new rule but if background-color: exists in the original one these will not equal to -1
                // while it should
                if (newCssBody.toString().trim().search(key + ':') === -1
                ||(newCssBody.toString().trim().search('-'+key + ':') !== -1
                    &&(newCssBody.indexOf(key+':',newCssBody.indexOf('-'+key+':')+2)===-1)
                    )) {
                    // de regel in customstyles bestaat niet in de originele en moet dus overgenomen worden
                    // add the style rule to the new css of the component
                    if (substringCustom.indexOf(';', startIndex) !== -1) {
                        newCssBody += substringCustom.substring(startIndex, substringCustom.indexOf(';', startIndex)+1).toString().trim()
                        startIndex = substringCustom.indexOf(';', startIndex) + 1
                        if (startIndex >= substringCustom.length) {
                            keyAvailable = false
                        }
                    } else {
                        keyAvailable = false
                        newCssBody += substringCustom.substr(startIndex).toString().trim()
                    }
                } else {
                    // zuiver key: is al aanwezig
                    // go the the next custom style rule
                    if (substringCustom.indexOf(';', startIndex) !== -1) {
                        // er is inderdaad nog een volgende stijlregel
                        startIndex = substringCustom.indexOf(';', startIndex) + 1
                        if (startIndex >= substringCustom.length) {
                            keyAvailable = false
                        }
                    } else {
                        keyAvailable = false
                    }
                }
            }
            return newCssBody
        }
        const extractSelector = function (pointer, cssStr) {
            return cssStr.toString().trim().substring(pointer, cssStr.toString().trim().indexOf('{', pointer))
        }
        const extractRules = function (selector, cssStr) {
            const selectorString = selector.toString().trim()
            const cssString = cssStr.toString().trim()
            if (cssString.indexOf(selectorString) !== -1) {
                const start = cssString.indexOf('{', cssString.indexOf(selectorString)) + 1
                return cssString.substring(start, cssString.indexOf('}', start))
            } else {
                return null
            }
        }
        if (customStyles.split('[').length > 1) {
            // in this case the customStyles target a specific layoutState

        } else {
            // the customStyles have to be applied to every possible layoutState of the component
            //EXAMPLE of A custom style string =>  div{border:none;background:none;color:black}div:hover{background-color:darkgray;color:white}
            for (let i = 0; i < Object.keys(this._layoutStates).length; i++) {
                // cssStr has possibly different selectors
                let cssStr = this._layoutStates[Object.keys(this._layoutStates)[i].toString()].css
                cssStr = cssStr.replace('<style>', '').replace('</style>', '').replace(' ', '').replace('\n', '').replace('\t', '').toString().trim()
                // for every selector customStyles has to be evaluated
                customStyles = customStyles.replace(' ', '').replace('\n', '').replace('\t', '').toString().trim()
                // in the end we get a new cssStr for the current layoutState where the <style> tag has be reattached to again
                let newCssStr = ''
                // for every selector in cssStr we attach a new body to newCssStr together with the selector
                // we use a pointer that points to the selector in cssStr that has to be processed
                let pointer = 0
                while (pointer < cssStr.length && pointer >= 0) {
                    // repeat the part from the do-block
                    // get the next selector
                    const originalSelector = extractSelector(pointer, cssStr)
                    // get the body (=cssRules) that belongs to this selector
                    const originalRules = extractRules(originalSelector, cssStr)
                    // get the body (=cssRules) that belong to the same selector but inside customStyles: if empty then the originalRules can stay
                    const newRules = extractRules(originalSelector, customStyles)
                    // create newCssRules that take the newRules into account
                    let newCssRules = ''
                    if (newRules) {
                        newCssRules = overrideCss(originalRules, newRules)
                    } else {
                        newCssRules = originalRules
                    }
                    newCssStr += originalSelector + '{' + newCssRules + '}'
                    // the pointer has to shift to the next selector
                    // if there is no next selector pointer has to be a negative number
                    // to prevent the while loop from running
                    pointer = cssStr.indexOf('}', pointer) + 1
                }
                // finish up the new style for this layoutState
                this._layoutStates[Object.keys(this._layoutStates)[i].toString()].css = '<style>' + newCssStr + '</style>'
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
                case 'number_of_rows_selected':
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
                case 'events':
                    if (this.hasAttribute('events')) {
                        this._eventHandler(this.getAttribute('events'))
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

    _eventHandler(eventProcess) {
        // typical format of an event-string:
        // event1/event2/../eventN:actions
        // typical format of actions:
        // action1,action2,...,actionN
        // an action can be of format: selector=>state where selector is a way to select to target element and state is the new state to put the target into
        // or can have the format: source => target in which case a VALUE or TEXT will be transferred from the source to the target upon which the target then automatically reacts
        // for instance by getting data from the server or showing the transferred text data in the UI of the target component
        // every action needs to be put in the actions array at initialization because it are these actions which will subsequently looked over to handle
        // this means that the _actions array has already to be set up for eventHandler to work properly
        // different events can result in the same actions
        // it is also possible that different events have different actions (one or more)
        // this is the format for this situation:
        // event1/event2/../eventN:actions;event1/event2/../eventN:actions
        // it follows the same pattern but separated by a semi-colon
        if(typeof eventProcess === 'string'){
            // storing the events for this component
            const events = eventProcess.split(';')
            for (let i=0;i<events.length;i++){
                const eventNames = events[i].split(':')[0].split('/')
                const actions = events[i].split(':')[1].split(',')
                eventNames.forEach(name=>{
                    actions.forEach(action=>{
                        this._events.forEach(evt => {
                            if (evt.hasOwnProperty(name.toString())) {
                                evt[name.toString()].push(action)
                            }
                        })
                    })
                })
            }
            // setting up all necessary eventListeners for this component
            this._events.forEach(evt=>{
                // event is an object with the eventName as a key and an array with actions that need to happen upon the happening of the event
                if(evt[Object.keys(evt)[0].toString()].length > 0){
                    switch (Object.keys(evt)[0].toString()){
                        case 'click':
                            this.addEventListener('click',this._eventHandler)
                            break
                        case 'load':
                            // a custom event, because the built-in load event works on the window object only (so it appears)
                            // this event gets fired as soon as the element is available and all initialisation is done
                            this.addEventListener('component-loaded', this._eventHandler)
                            break
                        case 'hover':
                            // todo how to trigger this on the right time?
                            this.addEventListener('component-hovered-over', this._eventHandler)
                            break
                        case 'hover-away':
                            // todo how to trigger this on the right time?
                            this.addEventListener('component-hovered-away-from', this._eventHandler)
                            break
                    }
                }
            })
        } else{
            // handling the actions that need to be performed through a function
            // that is called from within the switch that handles a particular event
            const processAction = (action)=>{
                const setSource = (source)=>{
                    // step 1 replace (n) with nth of type
                    if(source.indexOf('(')!==-1) {
                        let index = 0
                        let startString = source
                        while (startString.indexOf('(', index) !== -1) {
                            const firstPart = startString.substring(0, startString.indexOf('(', index))
                            const lastPart = startString.substr(startString.indexOf(')', index) + 1)
                            const replacement = ':nth-of-type(' + startString.substring(startString.indexOf('(', index) + 1, startString.indexOf(')', index)) + ')'
                            startString = firstPart + replacement + lastPart
                            index = firstPart.length + replacement.length
                        }
/*                        let current = this
                        while (current && current.tagName !== 'BODY') {
                            current = current.parentElement
                        }*/
/*                        if (!current) {
                            let root = this
                            while (root.parentElement) {
                                root = root.parentElement
                            }
                            sourceElements = root.querySelectorAll(startString)
                        } else {
                            sourceElements = document.querySelectorAll(startString)
                        }*/
                        source = startString
                    }
                    // step 2: handle this;this.parent etc. or a normal selector
                    if(source==='this'){
                        let arrOfElements = [this.tagName]
                        let current = this
                        while(current && current.tagName !== 'BODY'){
                            current = current.parentElement
                            if(current){
                                arrOfElements.push(current.tagName)
                            }
                        }
                        let selectorString = ''
                        arrOfElements = arrOfElements.reverse()
                        arrOfElements.forEach(pathEl=>{
                            if(selectorString.length>0){
                                selectorString += ' > ' + pathEl.toLowerCase()
                            } else{
                                selectorString += pathEl.toLowerCase()
                            }
                        })
                        if(selectorString.indexOf('body')===-1){
                            return [this]
                        } else{
                            return document.querySelectorAll(selectorString)
                        }
                    } else if(source.indexOf('this.parent')!==-1||source.indexOf('this.child')!==-1||source.indexOf('this.next')!==-1||source.indexOf('this.previous')!==-1){

                    }
                    else{
                        return document.querySelectorAll(source)
                    }
                }
                const source = action.split('=>')[0].toString().trim()
                const sourceElements = setSource(source)

                const target = action.split('=>')[1].trim()
                if(this._possibleLayoutStates.includes(target)){
                    sourceElements.forEach(srcEl=>{
                        srcEl.executeLayoutState(target)
                    })
                } else if(sourceElements[0]._getState('text') !== undefined){
                    const targetElements = document.querySelectorAll(target)
                    targetElements.forEach(trgtEl=>{
                        if(trgtEl._getState('text') !== undefined){
                            trgtEl._setState('text', sourceElements[0]._getState('text'))
                        }
                    })
                } else if(sourceElements[0]._getState('value') !== undefined){
                    const targetElements = document.querySelectorAll(target)
                    targetElements.forEach(trgtEl=>{
                        if(trgtEl._getState('value') !== undefined){
                            trgtEl._setState('value', sourceElements[0]._getState('value'))
                        }
                    })
                } else{

                }
            }
            switch (eventProcess.type) {
                case 'click':
                    if (this._currentLayoutState === 'enabled' || this._currentLayoutState === 'visible' ) {
                        console.log(this._events)
                        this._events.forEach(el => {
                            if (el.hasOwnProperty('click') && el.click.length > 0) {
                                el.click.forEach(act=>{
                                    console.log(act)
                                    processAction(act)
                                })
                            }
                        })
                    }
                    break
                case 'component-loaded':
                    this._events.forEach(el => {
                        if (el.hasOwnProperty('load') && el.load.length > 0) {
                            el.load.forEach(action=>{
                                processAction(action)
                            })
                        }
                    })
                    break
                case 'component-hovered-over':

                    break
                case 'component-hovered-away-from':

                    break
            }
        }
    }
}
