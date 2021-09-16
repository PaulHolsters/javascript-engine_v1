class PhjSelect extends ComponentLogics {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this._layoutStates = {
            enabled: {
                layoutState: {
                    disabled: false
                },
                css: `
<style>
                             
</style>
`
            },
            disabled: {
                layoutState: {
                    disabled: true
                },
                css: `
<style>
                             
</style>
`

            }
        }

        this._state = {
            hasLabel: false,
            label: '',
            selected: 0,
            options: [],
            text:''
        }
    }

    connectedCallback(){
        // set css of the webcomponent
        // set HTML of the webcomponent
        this._setLayoutState('enabled')
        // set HTML of the webcomponent
        this._setShadow(`
<select is="inner-select">
                        <option id="text" style="display: none"></option>
                        </select>
        `)
        // set innerhtml
        this._executeShadow()
        this.addEventListener('select-changed',this._eventHandler)
        console.log('eventlistener added')
        // set eventHandlers and handle attributes
        this._setUpAttributes('label','events','prop','text','options')
    }
}
customElements.define('phj-select',PhjSelect)
