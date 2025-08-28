import * as signalR from '@microsoft/signalr';
import { HUB_BASE_URL } from '../../constants/hubs';

const userString = localStorage.getItem('user');
const token = userString ? JSON.parse(userString)?.accessToken : null;

export const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${HUB_BASE_URL}hubs/notification`, {
    accessTokenFactory: () => token,
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();
