import { Thing } from './types';

// export type AudioInformations = {
//   url: string;
//   audio: HTMLAudioElement;
// }

export type AudiosMap = [number, string][];

declare global {
  interface Window {
    audiosManager: AudiosManager;
  }
}

export class AudiosManager {
  private audios: {[voiceIndex:number]: HTMLAudioElement} = {}

  constructor () {
    window.audiosManager = this;
  }

  public getThingAudio (thingId: number) {
    return this.audios[thingId]
  }
  public getThingAudioUrl (thing: Thing) {
    const audio = this.audios[thing.id]
    if (!audio) return undefined;
    return audio.src
  }

  // public updateThingAudio (thing: Thing, audioUrl: string) {
  //   const audio = this.audios[thing.id] = new Audio(audioUrl)
  //   audio.controls = true
  //   return audio
  // }

  private async getAudioMap (): Promise<AudiosMap> {
    return await (await fetch('/audios-map')).json()
  }

  public async loadAudios () {
    // Get all ids
    this.getAudioMap().then(map => map.forEach(([id, url]) => {
      // if (url.audio)
      this.loadThingAudio(id, `./audios/${id}.wav`)
    }))
  }

  public async loadThingAudio (thingId: number, audioUrl: string) {
    const audio = this.audios[thingId] = new Audio(audioUrl)
    audio.controls = true
    return audio
  }
  public async unloadThing (thing: Thing) {
    delete this.audios[thing.id]
  }

  public async sendThingAudio (thingId: number, blob: Blob) {
    const formData = new FormData
    formData.append('audio', blob)
    const response = await fetch(`./audio/${thingId}`, {
      method: 'PUT',
      body: formData
    })
    if (response.status !== 200) {
      throw new Error()
    }
  }

  public async removeThingAudio (thing: Thing) {
    await fetch(`./audio/${thing.id}`, {
      method: 'DELETE'
    })
    this.unloadThing(thing)
  }
}

window.audiosManager = new AudiosManager