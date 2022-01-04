import { LitElement, html, nothing } from 'lit';
import { Dialog } from '@material/mwc-dialog';
import { customElement, query, state } from 'lit/decorators.js';
import '@material/mwc-dialog'
import '@material/mwc-button'
import '@material/mwc-icon-button'

declare global {
  interface Window {
    audioRecorder: AudioRecorder;
  }
}

@customElement('audio-recorder')
export class AudioRecorder extends LitElement {
  @state()
  private recording = false;
  @state()
  private _audioUrl?: string;

  private _stream?: MediaStream;
  private _mediaRecorder?: MediaRecorder;
  // private _blob?: Blob;
  // private _thingId?: number;

  private _resolve?: (value: string) => void;
  private _reject?: (reason?: any) => void;

  @query('mwc-dialog') dialog!: Dialog;

  render() {
    return html`
    <mwc-dialog heading="Record voice">
      <div style="text-align:center">
        <mwc-icon-button icon=${!this.recording ? 'mic' : 'fiber_manual_record'}
          style="color:${!this.recording ? 'black' : 'red'}"
          @click=${() => this.toggleRecording()}
          dialogInitialFocus></mwc-icon-button>

        ${this._audioUrl ? html`
        <audio src=${this._audioUrl} controls style="display:block;margin-top:18px"></audio>
        ` : nothing}
      </div>

      <mwc-button outlined slot="secondaryAction"
        @click=${() => this.onDialogDismiss()}>cancel</mwc-button>
      <mwc-button unelevated slot="primaryAction"
        ?disabled=${!this._audioUrl}
        @click=${() => this.onDialogAccept()}>update</mwc-button>
    </mwc-dialog>
    `
  }

  private onDialogDismiss() {
    // const ok = confirm('If you cancel this recording will be lost. Are you sure to continue?')
    // if (!ok) { return }
    // Reset before closing
    this.dialog.close()
    this.reset()
    this._reject!()
  }

  private onDialogAccept() {
    // We leave the properties as is (for the form)
    // window.app.thingForm.requestUpdate()
    this.dialog.close()
    this._resolve!(this._audioUrl as string)
  }

  private async toggleRecording() {
    if (!this.recording) {
      // Initialize stream and recorder for the first time
      if (this._stream === undefined || this._mediaRecorder === undefined) {
        this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this._mediaRecorder = new MediaRecorder(this._stream)
      }

      const audioChunks: BlobPart[] = [];
      // On recorder start
      this._mediaRecorder.addEventListener('dataavailable', function (e) {
        audioChunks.push(e.data)
      })
      // On recorder stop
      this._mediaRecorder.addEventListener('stop', () => {
        const blob = new Blob(audioChunks)
        this._audioUrl = URL.createObjectURL(blob);
        this.recording = false;
      })

      this._mediaRecorder.start()
      this.recording = true;
    }
    else {
      this._mediaRecorder!.stop()
    }
  }

  public open (thingId: number) {
    // this._thingId = thingId
    this.dialog.show()
    return new Promise<string>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  private reset() {
    // this._blob = undefined;
    this._audioUrl = undefined;
    // this._thingId = undefined;
  }
}