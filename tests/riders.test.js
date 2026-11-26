import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' })
after(() => server.close())
const { RIDERS, cleanRider } = await server.ssrLoadModule('/src/riders.js')
const { createVehicleModel } = await server.ssrLoadModule('/src/vehicleModels.js')
const { Net } = await server.ssrLoadModule('/src/net.js')

test('all rider selections construct on every vehicle, with safe fallback', () => {
  assert.equal(cleanRider('invalid'), 'classic')
  for (const rider of RIDERS) for (const vehicle of ['road', 'bmx', 'mtb', 'car', 'heli']) {
    const model = createVehicleModel(vehicle, null, rider.id)
    assert.ok(model.root)
  }
})

test('host validates rider changes, broadcasts them, and resets guest readiness', () => {
  const net = new Net()
  net.isHost = true
  net.active = true
  net.phase = 'lobby'
  net.players = [{ pid: 0, name: 'Host', ready: true }, { pid: 1, name: 'Guest', ready: true }]
  let broadcast
  net.broadcast = (message) => { broadcast = message }
  net.hostData(1, { t: 'rider', r: 'cyan' })
  assert.equal(net.players[1].rider, 'cyan')
  assert.equal(net.players[1].ready, false)
  assert.equal(broadcast.players[1].rider, 'cyan')
  net.hostData(1, { t: 'rider', r: 'invalid' })
  assert.equal(net.players[1].rider, 'classic')
  net.phase = 'race'
  net.hostData(1, { t: 'rider', r: 'orange' })
  assert.equal(net.players[1].rider, 'classic')
})
