class PhjTable extends ComponentLogics {

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

        }

    }

    connectedCallback() {

    }
}

customElements.define('phj-table', PhjTable)
