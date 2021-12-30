import { css, html, LitElement, nothing } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import { Thing } from './types'
import '@material/mwc-icon'
import '@material/mwc-icon-button'
import '@material/mwc-button'
import '@material/mwc-dialog'
import '@material/mwc-snackbar'
// import {Html5QrcodeScanner} from 'html5-qrcode'
// @ts-ignore
// window.Html5QrcodeScanner = Html5QrcodeScanner;
import './qrcode-dialog'
import { QRCodeDialog } from './qrcode-dialog'

@customElement('qr-things')
export class QRThings extends LitElement {
  @state()
  private _data?: { [directory:string]: Thing[] };
  @state()
  private dirname?: string;

  @query('qrcode-dialog') qrCodeDialog!: QRCodeDialog;

  constructor() {
    super()
    this.fetchData()

    window.addEventListener('hashchange', (e) => {
      this.navigateAccordingly()
    })
  }

  static styles = css`
  header {
    background-color: #eeeeee;
    padding: 3px;
  }
  .directory {
    display: flex;
    align-items: center;
    background-color: #795548;
    color: white;
    cursor: pointer;
    padding: 7px;
    margin: 7px;
  }
  .thing {
    display: flex;
    align-items: center;
    background-color: #e0e0e0;
    padding: 4px 4px 4px 12px;
    margin: 6px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }
  `

  render () {
    if (this._data === undefined) return nothing;
    const directories = Object.keys(this._data)

    return html`
    <header style="display:flex;">
      <div style="flex:1"></div>
      <mwc-icon-button icon="qr_code_scanner"
        @click=${() => this.showScannerDialog()}></mwc-icon-button>
    </header>

    ${!this.dirname ? html`
      ${directories.map(d => html`
      <div class="directory"
        @click=${() => this.goToDirectory(d)}><mwc-icon style="margin-right:5px;">folder</mwc-icon><span>${d}</span></div>
      `)}
      <div style="text-align:center">
        <mwc-button unelevated icon="add"
          @click=${() => this.addDirectory()}>add</mwc-button>
      </div>
    ` : nothing }


    ${this.dirname ? html`
      ${this._data[this.dirname].map(t => {
        return html`<div class="thing"><span style="flex:1">${t.label}</span><mwc-icon-button icon="qr_code_scanner" @click=${() => this.qrCodeDialog.open(t.id)}></mwc-icon-button></div>`
      })}
    ` : nothing}


    <qrcode-dialog></qrcode-dialog>

    <mwc-snackbar id=snackbar></mwc-snackbar>
    `
  }

  get directories () {
    if (!this._data) return []
    return Object.keys(this._data)
  }

  private addDirectory() {
    const name = prompt('directory name')
    if (name === null || name === '') {
      return;
    }
    if (this.directories.indexOf(name) >= 0) {
      window.toast('This collection already exists')
      return;
    }
    this._data![name] = []
    this.goToDirectory(name)
  }

  private showScannerDialog() {
    window.openScannerDialog()
  }

  private goToDirectory(d: string) {
    this.dirname = d;
    window.location.hash = `${d}`
  }

  private navigateAccordingly () {
    /* Process the hash and redirect to the proper view */
    // Get the hash
    const hash = window.location.hash.slice(1)
    if (hash) {
      this.dirname = hash
    }
    else {
      this.dirname = undefined;
    }
  }

  private async fetchData () {
    const response = await fetch('/data')
    this._data = await response.json()
  }
}


declare global {
  interface Window {
    openScannerDialog: () => void;
    toast: (message: string, timeoutMs?: number) => void;
  }
}