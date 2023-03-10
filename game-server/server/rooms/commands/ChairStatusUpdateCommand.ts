import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IParaState } from '../../../types/IParaState'

type Payload = {
  client: Client
  tableId: string
  chairId: string
  status: boolean
}

export class ChairStatusUpdateCommand extends Command<IParaState, Payload> {
  execute(data: Payload) {
    const { client, tableId, chairId, status } = data
    const chair = this.room.state.chairs.get(String(chairId))
    const clientId = client.sessionId
    if (!chair) return
    chair.occupied = status;
    chair.clientId = clientId;
  }
}
