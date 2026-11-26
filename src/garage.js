import { VEHICLES, PAINTS, getVehicle, vehicleIcon } from './vehicles.js'
import { RIDERS, cleanRider } from './riders.js'
import { formatTime } from './hud.js'

const $ = (id) => document.getElementById(id)

const STAT_LABELS = [
  ['speed', 'Top speed'],
  ['accel', 'Acceleration'],
  ['handling', 'Handling'],
  ['air', 'Air'],
]

/**
 * Garage screen: pick a vehicle and a paint colour. The 3D scene behind it shows the
 * selected vehicle; main.js swaps the model whenever `onChange` fires.
 */
export class Garage {
  constructor({ vehicle, paint, rider, bestFor, onChange, onRiderChange }) {
    this.rider = cleanRider(rider)
    this.onRiderChange = onRiderChange
    this.vehicle = vehicle
    this.paint = Math.max(0, Math.min(PAINTS.length - 1, Number(paint) || 0))
    this.bestFor = bestFor
    this.onChange = onChange
    this.online = false
    this.el = {
      screen: $('screen-garage'),
      title: $('garage-title'),
      type: $('garage-type'),
      list: $('garage-list'),
      desc: $('garage-desc'),
      stats: $('garage-stats'),
      paints: $('garage-paints'),
      note: $('garage-note'),
      riders: $('garage-riders'),
    }

    this.tiles = VEHICLES.map((v) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'garage-tile'
      b.setAttribute('role', 'radio')
      b.dataset.id = v.id
      b.innerHTML = `${vehicleIcon(v.id, 26)}<span>${v.name}</span>`
      b.addEventListener('click', () => this.select(v.id))
      this.el.list.append(b)
      return b
    })
    this.el.list.addEventListener('keydown', (e) => this.keyNav(e, this.tiles, (i) => this.select(VEHICLES[i].id)))

    this.swatches = PAINTS.map((c, i) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'swatch'
      b.style.background = c
      b.setAttribute('role', 'radio')
      b.setAttribute('aria-label', `Paint ${i + 1}`)
      b.addEventListener('click', () => this.setPaint(i))
      this.el.paints.append(b)
      return b
    })
    this.el.paints.addEventListener('keydown', (e) => this.keyNav(e, this.swatches, (i) => this.setPaint(i)))
    this.riderTiles = RIDERS.map((r) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'rider-tile'
      b.setAttribute('role', 'radio')
      if (r.image) {
        const img = document.createElement('img')
        img.src = r.image
        img.alt = ''
        b.append(img)
      }
      const label = document.createElement('span')
      label.textContent = r.name
      b.append(label)
      b.addEventListener('click', () => this.selectRider(r.id))
      this.el.riders.append(b)
      return b
    })
    this.el.riders.addEventListener('keydown', (e) => this.keyNav(e, this.riderTiles, (i) => this.selectRider(RIDERS[i].id)))
    this.render()
  }

  selectRider(id) {
    id = cleanRider(id)
    if (id === this.rider) return
    this.rider = id
    this.render()
    this.onRiderChange(id)
  }

  keyNav(e, items, pick) {
    const i = items.indexOf(document.activeElement)
    if (i < 0) return
    let j = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % items.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + items.length) % items.length
    if (j < 0) return
    e.preventDefault()
    items[j].focus()
    pick(j)
  }

  /** In an online room the paint follows the room slot, so the picker is locked. */
  setOnline(on) {
    this.online = on
    this.render()
  }

  select(id) {
    if (id === this.vehicle) return
    this.vehicle = id
    this.render()
    this.onChange(this.vehicle, this.paint)
  }

  setPaint(i) {
    if (this.online || i === this.paint) return
    this.paint = i
    this.render()
    this.onChange(this.vehicle, this.paint)
  }

  render() {
    const v = getVehicle(this.vehicle)
    const el = this.el
    el.title.textContent = v.name
    el.type.textContent = v.type
    el.desc.textContent = `${v.desc} ${v.hint}`
    for (const t of this.tiles) {
      const on = t.dataset.id === v.id
      t.classList.toggle('on', on)
      t.setAttribute('aria-checked', String(on))
      t.tabIndex = on ? 0 : -1
    }
    el.stats.replaceChildren()
    for (const [key, label] of STAT_LABELS) {
      const group = document.createElement('div')
      group.className = 'stat-item'
      const dt = document.createElement('dt')
      dt.textContent = label
      const dd = document.createElement('dd')
      dd.className = 'bars'
      dd.setAttribute('aria-label', `${v.stats[key]} out of 5`)
      for (let i = 0; i < 5; i++) {
        const seg = document.createElement('span')
        if (i < v.stats[key]) seg.className = 'fill'
        seg.setAttribute('aria-hidden', 'true')
        dd.append(seg)
      }
      group.append(dt, dd)
      el.stats.append(group)
    }
    this.swatches.forEach((s, i) => {
      const on = i === this.paint
      s.classList.toggle('on', on)
      s.setAttribute('aria-checked', String(on))
      s.tabIndex = on ? 0 : -1
      s.disabled = this.online
    })
    this.riderTiles.forEach((tile, i) => {
      const on = RIDERS[i].id === this.rider
      tile.classList.toggle('on', on)
      tile.setAttribute('aria-checked', String(on))
      tile.tabIndex = on ? 0 : -1
    })
    const best = this.bestFor(v.id)
    const bestText = best ? `Best solo time: ${formatTime(best)}` : 'No solo time with this vehicle yet'
    el.note.textContent = this.online ? `${bestText}. In online rooms your colour matches your room slot.` : bestText
  }
}
