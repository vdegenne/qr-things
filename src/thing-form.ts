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
    <mwc-dialog heading=${thing?.label || ''} escapeKeyAction="" scrimClickAction="">

      ${this.thing ? html`
        <mwc-textfield label="label" .value=${live(thing?.label || '')}
          @click=${(e) => { if (e.target.value === 'Untitled Thing') e.target.select() }}
          @keyup=${(e) => this.onLabelKeyup(e)}
        ></mwc-textfield>

        <hr>

        <div style="display:flex;align-items: center;justify-content:space-between">
          <span>no audio</span>
          <mwc-button unelevated icon="mic"
            @click=${() => window.audioRecorder.open(thing!.id)}
          >record</mwc-button>
        </div>

      ` : nothing}

      <mwc-button outlined slot="secondaryAction" dialogAction="close"
        @click=${() => this._reject()}>cancel</mwc-button>
      <mwc-button unelevated slot="primaryAction" dialogAction="close"
        @click=${() => this._resolve(this.thing)}>add</mwc-button>
    </mwc-dialog>
    `
  }

  private onLabelKeyup (e) {
    this.thing[this.type]!.label = (e.target as TextField).value;
    window.app.requestUpdate()
  }

  public open (type: 'add'|'edit', thing: Thing) {
    this.type = type;
    this.thing[type]! = thing;
    this.requestUpdate()
    this.dialog.show()
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    })
  }

  public reset () {
  }
}