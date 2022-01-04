import { css, html, LitElement, nothing } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import { Thing } from './types'
import '@material/mwc-icon'
import '@material/mwc-icon-button'
import '@material/mwc-button'
import '@material/mwc-dialog'
import '@material/mwc-snackbar'
import './qrcode-dialog'
import { QRCodeDialog } from './qrcode-dialog'
import './data-manager'
import './thing-form'
import { DataManager } from './data-manager'
// import { ThingForm } from './thing-form'
import './thing-informations'
import './AudiosManager'
import './audio-recorder'
import { ThingForm } from './thing-form'

@customElement('qr-things')
export class QRThings extends LitElement {
  private dataManager: DataManager;

  @state()
  private collectionName?: string;

  @query('qrcode-dialog') qrCodeDialog!: QRCodeDialog;
  // @query('thing-form') thingForm!: ThingForm;

  constructor() {
    super()
    window.app = this;
    window.dataManager = this.dataManager = new DataManager()
    // window.audioRecorder = this.audioRecorder = new AudioRecorder()

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
    color: #795548;
    cursor: pointer;
    padding: 12px;
    margin: 7px;
  }
  .directory:hover {
    background-color: #eeeeee;
  }
  .thing {
    display: flex;
    align-items: center;
    background-color: #e0e0e0;
    padding: 6px;
    margin: 6px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }
  .thing mwc-icon-button {
    /* --mdc-icon-button-size: 19px;
    --mdc-icon-size: 11px; */
  }
  `

  render () {
    const collections = this.dataManager.collections;

    return html`
    <header style="display:flex;">
      <div style="flex:1"></div>
      <mwc-icon-button icon="qr_code_scanner"
        @click=${() => this.showScannerDialog()}></mwc-icon-button>
    </header>

    ${!this.collectionName ? html`
      ${collections.map(d => html`
      <div class="directory"
        @click=${() => this.goToDirectory(d)}><mwc-icon style="margin-right:5px;">folder</mwc-icon><span>${d}</span></div>
      `)}
      <div style="text-align:center">
        <mwc-button unelevated icon="add"
          @click=${() => this.addDirectory()}>add</mwc-button>
      </div>
    ` : nothing}


    ${this.collectionName ? html`
      ${this.dataManager.getThings(this.collectionName).map(t => {
        return html`<div class="thing">
          <span>${t.label}</span>
          <span style="flex:1;color:grey;font-size:0.8em;padding-left:6px">#${t.id}</span>
          <mwc-icon-button icon="edit"
            @click=${() => this.onEditButtonClick(t)}></mwc-icon-button>
          <mwc-icon-button icon="qr_code_scanner" @click=${() => this.qrCodeDialog.open(t.id)}></mwc-icon-button>
        </div>`
      })}
      <div style="text-align:center">
        <mwc-button unelevated icon="add"
          @click=${() => this.onAddThingClick()}>add QR code</mwc-button>
      </div>
    ` : nothing}


    <qrcode-dialog></qrcode-dialog>

    <!-- <thing-form></thing-form> -->

    <mwc-snackbar id=snackbar></mwc-snackbar>
    `
  }

  private addDirectory() {
    const name = prompt('directory name')
    if (name === null || name === '') {
      return
    }
    if (this.dataManager.collectionExists(name)) {
      window.toast('This collection already exists')
      return
    }
    this.dataManager.addCollection(name)
    this.goToDirectory(name)
  }

  private async editThing (type: 'add'|'edit', thing: Thing) {
    try {
      const returned = await window.thingForm.open(type, thing) as Thing
      // We save the audio if there is one and it's different from the database
      let audioUrl = window.thingForm.audioUrl[type]
      if (audioUrl && audioUrl !== window.audiosManager.getThingAudioUrl(returned)) {
        // We try to save the audio file remotely before saving the general data
        const blob = await (await fetch(audioUrl)).blob()
        try {
          await window.audiosManager.sendThingAudio(returned.id, blob)
        } catch (e) {
          window.toast('Something went wrong while trying to save the audio file')
        }
        window.audiosManager.loadThingAudio(returned.id, window.thingForm.audioUrl[type]!)
      }

      // we finally save all the data remotely
      try {
        // @TODO: Do not save if thing's metadata haven't changed
        await window.dataManager.saveRemote()
      } catch (e) {
        window.toast('Something went wrong while trying to save the data remotely')
      }
    } catch (e) {
      // on cancel
      throw e
    }
  }

  private async onAddThingClick() {
    // Construct a new thing
    // Or reuse if there is one in the form
    let thing
    if (window.thingForm.thing['add']) {
      thing = this.dataManager.addThing(this.collectionName!, window.thingForm.thing['add'])
    }
    else {
      thing = this.dataManager.addThing(this.collectionName!)
    }
    this.requestUpdate()

    try {
      if (window.thingForm.type === 'edit') {

      }
      const result = await this.editThing('add', thing)
      window.thingForm.reset()
    }
    catch (e) {
      this.dataManager.removeThing(thing)
    }
    finally {
      this.requestUpdate()
    }
  }

  private async onEditButtonClick(t: Thing) {
    const clone = JSON.parse(JSON.stringify(t)) // we clone the object in case of a drawback
    try {
      await this.editThing('edit', t)
    }
    catch (e) {
      this.dataManager.replaceThing(t, clone)
    }
    finally {
      this.requestUpdate()
    }
  }

  // private async openThingFormDialog (thing: Thing) {
  //   try {
  //     const result = await this.thingForm.open(thing)
  //     // success we save the informations
  //     this.dataManager.saveRemote()
  //   } catch (e) {
  //     window.toast('cancelled')
  //     throw e
  //   }
  // }

  private showScannerDialog() {
    window.openScannerDialog()
  }

  private goToDirectory(d: string) {
    this.collectionName = d;
    window.location.hash = `${d}`
  }

  private navigateAccordingly () {
    /* Process the hash and redirect to the proper view */
    // Get the hash
    const hash = window.location.hash.slice(1)
    if (hash) {
      this.collectionName = hash
    }
    else {
      this.collectionName = undefined;
    }
  }
}


declare global {
  interface Window {
    app: QRThings;
    thingForm: ThingForm;
    openScannerDialog: () => void;
    toast: (message: string, timeoutMs?: number) => void;
  }
}