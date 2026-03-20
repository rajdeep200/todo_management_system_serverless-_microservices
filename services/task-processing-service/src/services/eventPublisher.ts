import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const eventBridgeClient = new EventBridgeClient({});
const eventBusName = process.env.TODO_EVENT_BUS_NAME as string;

export class EventPublisher {
  async publish(detailType: string, source: string, detail: Record<string, unknown>): Promise<void> {
    await eventBridgeClient.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: eventBusName,
            DetailType: detailType,
            Source: source,
            Detail: JSON.stringify({
              eventVersion: '1.0',
              ...detail
            })
          }
        ]
      })
    );
  }
}
