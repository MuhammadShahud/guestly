/* eslint-disable prettier/prettier */
import AWS from 'aws-sdk';
import chalk from 'chalk';

export async function socketsHandler(event, context) {
  console.log('socket connected');

  const routeKey = event.requestContext.routeKey;
  const connectionId = event.requestContext.connectionId;
  console.log(`Connection ID: ${connectionId}`);

  const message = event.body || '';
  console.log(message);

  switch (routeKey) {
    case '$connect': {
      console.log(`${chalk.greenBright('Socket connection established')}`);
      break;
    }
    case '$disconnect': {
      console.log(`${chalk.redBright('Socket connection ended')}`);
      break;
    }
    case '$disconnect': {
      console.log(`${chalk.redBright('Socket connection ended')}`);
      break;
    }
    case '$default': {
      console.log(
        `${chalk.greenBright('Default. Will notify the client soon')}`,
      );
      sendMessageToClient(
        connectionId,
        'Server: Hello from the server!',
        `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
      );
      break;
    }
    case 'join': {
      console.log(`${chalk.redBright('Join Event triggered')}`);
      break;
    }
  }

  return {
    statusCode: 200,
  };
}

async function sendMessageToClient(connectionId, message, endpoint) {
  console.log(endpoint);
  try {
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: endpoint,
      region: 'eu-central-1',
    });
    await apiGatewayManagementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({ message }),
      })
      .promise();
    console.log('Message sent successfully to client');
  } catch (error) {
    console.error('Error sending message to client:', error);
    throw error;
  }
}
