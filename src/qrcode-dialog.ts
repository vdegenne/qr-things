import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import '@material/mwc-dialog'
import '@material/mwc-button'
import { Dialog } from '@material/mwc-dialog';

@customElement('qrcode-dialog')
export class QRCodeDialog extends LitElement {
  @property()
  private data?: string;

  @query('canvas') canvas!: HTMLCanvasElement;
  @query('mwc-dialog') dialog!: Dialog;

  render() {
    return html`
    <mwc-dialog heading="QR Code">
      <canvas></canvas>
      <mwc-button outlined slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>
    `
  }

  public open (data: string|number) {
    this.data = `${data}`;
    window.QRCode.toCanvas(this.canvas, `${data}`)
    this.dialog.show()
  }
}

declare global {
  interface Window {
    QRCode: any
  }
}