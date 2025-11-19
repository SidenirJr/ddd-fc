import EventInterface from "../../@shared/event/event.interface";

export type CustomerAddressChangedEventData = {
  id: string;
  name: string;
  address: {
    street: string;
    number: number;
    zip: string;
    city: string;
  };
};

export default class CustomerAddressChangedEvent implements EventInterface {
  dataTimeOccurred: Date;
  eventData: CustomerAddressChangedEventData;

  constructor(eventData: CustomerAddressChangedEventData) {
    this.dataTimeOccurred = new Date();
    this.eventData = eventData;
  }
}

