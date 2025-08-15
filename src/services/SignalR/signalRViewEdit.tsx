// src/services/realtime/signalRClient.ts
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

let connection: HubConnection | null = null;

export function getDocumentHub(): HubConnection {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(`https://localhost:7128/hubs/document`)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  return connection;
}
