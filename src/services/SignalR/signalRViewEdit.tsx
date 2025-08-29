// src/services/realtime/signalRClient.ts
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { HUB_BASE_URL } from '../../constants/hubs';

let connection: HubConnection | null = null;

export function getDocumentHub(): HubConnection {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(`${HUB_BASE_URL}hubs/document`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  return connection;
}
