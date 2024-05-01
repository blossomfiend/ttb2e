export default class TtbChatMessage extends ChatMessage {
    /** @inheritDoc */
    async getHTML() {
        if (this.type === "flip") {
            return `<div class="flip"></div>`;
        }

        return super.getHTML();
    }
}
