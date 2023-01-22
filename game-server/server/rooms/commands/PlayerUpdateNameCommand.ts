import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IParaState } from '../../../types/IParaState'

type Payload = {
  client: Client
  name: string
  userId: string
}

export default class PlayerUpdateNameCommand extends Command<IParaState, Payload> {
  execute(data: Payload) {
    const { client, name, userId  } = data

    const player = this.room.state.players.get(client.sessionId)
    if (!player) return
    player.name = name
    player.userId = userId
  }
}