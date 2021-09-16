class InnerSelect extends HTMLSelectElement {
    constructor() {
        super();
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

    _notifyParent(){
        // todo create custom event that bubbles up to the root component: composed path = true!
        const selectChanged = new Event('select-changed',{bubbles:true,composed:true})
        this.dispatchEvent(selectChanged)
    }

    connectedCallback(){

    }
}
customElements.define('inner-select',InnerSelect,{extends:'select'})
