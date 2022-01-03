import { LitElement, html, nothing } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';

@customElement('thing-informations')
export class ThingInformations extends LitElement {
  @property({ type: Number })
  private thingId?: number;

  render () {
    if (this.thingId === undefined) return nothing;

    // if (typeof this.thingId === 'string') {
    //   // Attempt to parse the string
    //   id = parseInt(this.thingId)
    //   if (id.toString() !== this.thingId) {
    //     return html`The QR Code is not valid in this application`
    //   }
    // }
    // else {
    //   id = this.thingId;
    // }

    const thing = window.dataManager.getThingById(this.thingId)
    if (!thing) {
      return html`This QR Code is not registered`
    }

    return html`
    ${thing.label}
    `
  }

  playSound () {
    const audio = window.audiosManager.getThingAudio(
      window.dataManager.getThingById(this.thingId!)!
    )
    if (audio) {
      audio.play()
    }
  }
}