import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IParaState } from '../../../types/IParaState'

type Payload = {
  client: Client
  tableId: string
}

export class TableAddUserCommand extends Command<IParaState, Payload> {
  execute(data: Payload) {
    const { client, tableId } = data
    const table = this.room.state.tables.get(tableId)
    const clientId = client.sessionId

    if (!table || table.connectedUser.has(clientId)) return
    table.connectedUser.add(clientId)
  }
}

export class TableRemoveUserCommand extends Command<IParaState, Payload> {
  execute(data: Payload) {
    const { client, tableId } = data
    const table = this.state.tables.get(tableId)

    if (table?.connectedUser.has(client.sessionId)) {
      table.connectedUser.delete(client.sessionId)
    }
  }
}