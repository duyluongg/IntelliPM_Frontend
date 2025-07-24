import * as signalR from '@microsoft/signalr';

const userString = localStorage.getItem('user');
const token = userString ? JSON.parse(userString)?.accessToken : null;

export const connection = new signalR.HubConnectionBuilder()
  .withUrl('https://localhost:7128/hubs/notification', {
    accessTokenFactory: () => token,
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();
