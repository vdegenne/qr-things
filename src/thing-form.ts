import { LitElement, html, nothing, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js'
import '@material/mwc-dialog'
import '@material/mwc-textfield'
import { Dialog } from '@material/mwc-dialog';
import { Thing } from './types';
import { TextField } from '@material/mwc-textfield';

@customElement('thing-form')
export class ThingForm extends LitElement {
  @state()
  public type: 'add'|'edit' = 'add';

  @state()
  public thing: { 'add'?: Thing, 'edit'?: Thing } = { 'add': undefined, 'edit': undefined};
  @state()
  public audioUrl: { 'add'?: string, 'edit'?: string } = { 'add': undefined, 'edit': undefined };

  private _resolve!: (value: unknown) => void;
  private _reject!: (reason?: any) => void;

  @query('mwc-dialog') dialog!: Dialog;

  static styles = css`
  mwc-textfield {
    width: 100%;
  }
  hr {
    border-width: 0;
  }
  `

  render () {
    // const thing = this.thing && window.app.getThing(this.thing)
    const thing = this.thing[this.type]

    return html`
    <mwc-dialog .heading=${html`<mwc-icon>view_in_ar</mwc-icon><span style="vertical-align:text-bottom;margin-left:5px">${this.type}</span>`} escapeKeyAction="" scrimClickAction="">

      ${this.thing ? html`
        <mwc-textfield label="label" .value=${live(thing?.label || '')}
          @click=${(e) => { if (e.target.value === 'Untitled Thing') e.target.select() }}
          @keyup=${(e) => this.onLabelKeyup(e)}
        ></mwc-textfield>

        <hr>

        <div style="display:flex;align-items:center;justify-content:space-between">
          ${this.audioUrl[this.type] ? html`
          <audio src=${this.audioUrl[this.type]!} controls style="display:block"></audio>
          ` : html`
          <span style="padding-left:19px">no audio</span>
          `}
          <mwc-icon-button unelevated icon="mic"
            style="color:#4caf50"
            @click=${() => this.onRecordButtonClick()}
          ></mwc-icon-button>
        </div>

      ` : nothing}

      <mwc-button outlined slot="secondaryAction" dialogAction="close"
        @click=${() => this._reject()}>cancel</mwc-button>
      <mwc-button unelevated slot="primaryAction" dialogAction="close"
        @click=${() => this._resolve(this.thing[this.type])}>add</mwc-button>
    </mwc-dialog>
    `
  }

  private async onRecordButtonClick() {
    try {
      const audioUrl = await window.audioRecorder.open(0)
      this.audioUrl[this.type] = audioUrl
    } catch (e) {
      // cancelled
    }
    this.requestUpdate()
  }

  private onLabelKeyup (e) {
    this.thing[this.type]!.label = (e.target as TextField).value;
    window.app.requestUpdate()
  }

  public open (type: 'add'|'edit', thing: Thing) {
    this.type = type;
    this.thing[type]! = thing;
    if (type === 'edit') {
      this.audioUrl[type] = window.audiosManager.getThingAudioUrl(thing)
    }
    this.requestUpdate()
    this.dialog.show()
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    })
  }

  public reset () {
    this.audioUrl[this.type] = undefined
    this.thing[this.type] = undefined
    this.requestUpdate()
  }
}