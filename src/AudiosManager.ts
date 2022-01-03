import { Thing } from './types';

export type AudioInformations = {
  url: string;
  audio: HTMLAudioElement;
}

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

  public getThingAudio (thing: Thing) {
    return this.audios[thing.id]
  }

  public async loadAudios () {
    // Get all ids
    window.dataManager.things.forEach(t => {
      if (t.audio)
        this.loadThing(t)
    })
  }

  public async loadThing (thing: Thing) {
    if (thing.audio === false) return undefined;
    return this.audios[thing.id] = new Audio(`./audios/${thing.id}.wav`)
  }
  public async unloadVoice (thing: Thing) {
    delete this.audios[thing.id]
  }

  public async sendVoiceAudio (thing: Thing, blob: Blob) {
    const formData = new FormData
    formData.append('audio', blob)
    await fetch(`/audio/${thing.id}`, {
      method: 'POST',
      body: formData
    })
  }

  public async removeVoiceAudio (thing: Thing) {
    await fetch(`/audio/${thing.id}`, {
      method: 'DELETE'
    })
    this.unloadVoice(thing)
  }
}

window.audiosManager = new AudiosManager