import EventInterface from "../../@shared/event/event.interface";

export type CustomerCreatedEventData = {
  id: string;
  name: string;
};

export default class CustomerCreatedEvent implements EventInterface {
  dataTimeOccurred: Date;
  eventData: CustomerCreatedEventData;

  constructor(eventData: CustomerCreatedEventData) {
    this.dataTimeOccurred = new Date();
    this.eventData = eventData;
  }
}

