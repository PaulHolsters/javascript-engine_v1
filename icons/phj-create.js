class PhjCreate extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
    }

    connectedCallback(){
        this.shadowRoot.innerHTML = `
<style>
span{
display: inline-block;
width: fit-content;
font-weight: bold;
}
</style>
        <span>+</span>
        `
    }
}

customElements.define('phj-create',PhjCreate)
