import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const eventBridgeClient = new EventBridgeClient({});
const eventBusName = process.env.TODO_EVENT_BUS_NAME as string;

interface PublishEventParams {
  detailType: string;
  source: string;
  detail: Record<string, unknown>;
}

export class EventPublisher {
  async publish(params: PublishEventParams): Promise<void> {
    await eventBridgeClient.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: eventBusName,
            Source: params.source,
            DetailType: params.detailType,
            Detail: JSON.stringify({
              eventVersion: '1.0',
              ...params.detail
            })
          }
        ]
      })
    );
  }
}
