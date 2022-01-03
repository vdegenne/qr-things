import { Thing } from './types';


export class DataManager {
  public data: {[collectionName: string]: Thing[]} = {}

  constructor() {
    this.fetchData()
  }

  /* Adders */
  public addCollection (name: string) {
    this.data[name] = []
  }

  public addThing (collectionName: string, thing?: Thing) {
    if (!thing) {
      thing = {
        id: this.nextId,
        label: 'Untitled Thing',
        audio: false,
        playAudioOnScan: true
      }
    }
    this.data[collectionName].push(thing)
    return thing
  }

  /* Removers */
  public removeThing (thing: Thing) {
    const collectionName = this.getThingCollectionName(thing)
    const index = this.data[collectionName].indexOf(thing)
    return this.data[collectionName].splice(index, 1)
  }

  public removeThingById (id: number) {
    const thing = this.getThingById(id)
    if (!thing) {
      console.warn('Trying to remove a non-existent element')
      return undefined
    }
    return this.removeThing(thing)
  }


  /* Getters */
  public get collections () {
    return Object.keys(this.data)
  }

  public getThings (collectionName?: string) {
    if (collectionName)
      return this.data[collectionName]
    else {
      return Object.values(this.data).reduce(function (a, b) {
        return a.concat(b)
      })
    }
  }
  public get things () { return this.getThings() }

  public getThing (collectionName: string, label: string) {
    return this.data[collectionName].find(t => t.label === label)
  }
  public getThingById (id: number) {
    return this.things.find(t => t.id === id)
  }

  public getThingCollectionName (thing: Thing) {
    return Object.entries(this.data).find(([collectionName, things]) => things.indexOf(thing) >= 0)![0]
  }
  public getThingCollectionNameById (id: number) {
    const thing = this.getThingById(id)
    if (!thing) {
      return undefined
    }
    return this.getThingCollectionName(thing)
  }

  public get nextId () {
    const ids = this.things.map(t => t.id).sort()
    let id = 0
    while (ids.indexOf(id) >= 0)
      id++;
    return id;
  }


  /* Exists */
  public collectionExists (name: string) { return name in this.data }

  public thingExists (label: string, collectionName: string) {
    if (collectionName) {
      return !!this.getThing(collectionName, label)
    }
  }


  public replaceThing (oldThing: Thing, newThing: Thing) {
    const collection = this.getThingCollectionName(oldThing)
    const index = this.data[collection].indexOf(oldThing)
    this.data[collection][index] = newThing;
  }


  /* Data related */
  private async fetchData () {
    const response = await fetch('/data')
    this.data = await response.json()
    window.app.requestUpdate()
    window.audiosManager.loadAudios()
  }

  public async saveRemote () {
    await fetch('/data', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(this.data)
    })
  }
}

declare global {
  interface Window {
    dataManager: DataManager;
  }
}