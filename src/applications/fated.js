import ActorSheetComponent from "../components/ActorSheet.svelte";
import {SYSTEM_ID} from "../globals.js";

export class TtbActorSheetSvelte extends ActorSheet {
    constructor(data, options) {
        super(data, options);
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fated", "sheet", "actor"],
            template: `systems/${SYSTEM_ID}/templates/svelte_form.hbs`,
            width: 600,
            height: 600,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features"}]
        });
    }

    /** @override */
    async getData(options = {}) {
        return super.getData();
    }

    /** @override */
    async _render(force=false, options={}) {
        // Do not render under certain conditions
        const states = Application.RENDER_STATES;
        this._priorState = this._state;
        if ( [states.CLOSING, states.RENDERING].includes(this._state) ) return;

        // Applications which are not currently rendered must be forced
        if ( !force && (this._state <= states.NONE) ) return;

        // Begin rendering the application
        if ( [states.NONE, states.CLOSED, states.ERROR].includes(this._state) ) {
            console.log(`${vtt} | Rendering ${this.constructor.name}`);
        }
        this._state = states.RENDERING;

        // Merge provided options with those supported by the Application class
        foundry.utils.mergeObject(this.options, options, { insertKeys: false });
        options.focus ??= force;

        // Get the existing HTML element and application data used for rendering
        const element = this.element;
        const data = await this.getData(this.options);

        let html;

        // If the application already exists in the DOM, just update the components props, Svelte doesn't need to rerender
        if ( element.length ) {
            this.svelteApp.$set(data);
            html = this.element;
        }
        // Otherwise render a new app
        else {
            // Render the inner content
            const inner = await this._renderInner(data);

            // Wrap a popOut application in an outer frame
            if ( this.popOut ) {
                html = await this._renderOuter();
                html.find(".window-content").append(inner);
                ui.windows[this.appId] = this;
            }

            // Add the HTML to the DOM and record the element
            this._injectHTML(html);

            this.svelteApp = new ActorSheetComponent({
                target: this.element.find(".svelte-container")[0],
                props: data,
            });

            if ( !this.popOut && this.options.resizable ) new Draggable(this, html, false, this.options.resizable);

            // need to get the inner element used earlier by what's actually in the DOM
            const innerElement = this.element.find(".svelte-container");

            // dirty fix because FormApplication usually sets this in _renderInner, which doesn't work here
            this.form = innerElement[0];

            // Activate event listeners on the inner HTML
            this._activateCoreListeners(innerElement);
            this.activateListeners(innerElement);

            // Set the application position (if it's not currently minimized)
            if ( !this._minimized ) {
                foundry.utils.mergeObject(this.position, options, {insertKeys: false});
                this.setPosition(this.position);
            }
        }

        // Apply focus to the application, maximizing it and bringing it to the top
        if ( this.popOut && (options.focus === true) ) this.maximize().then(() => this.bringToTop());

        // Dispatch Hooks for rendering the base and subclass applications
        for ( let cls of this.constructor._getInheritanceChain() ) {
            Hooks.callAll(`render${cls.name}`, this, html, data);
        }
        this._state = states.RENDERED;
    }

    /** @override */
    async close(options = {}) {
        const ret = await super.close(options);
        this.svelteApp.$destroy();
        return ret;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
    }

    _getSubmitData(updateData = {}) {
        return super._getSubmitData(updateData);
    }
}
