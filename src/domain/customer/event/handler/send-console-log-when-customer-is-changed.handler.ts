import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerAddressChangedEvent from "../customer-address-changed.event";

export default class SendConsoleLogWhenCustomerAddressIsChangedHandler
  implements EventHandlerInterface<CustomerAddressChangedEvent>
{
  handle(event: CustomerAddressChangedEvent): void {
    const { id, name, address } = event.eventData;
    const formatedAddress = `${address.street}, ${address.number}, ${address.zip} ${address.city}`;

    console.log(
      `Endereço do cliente: ${id}, ${name} alterado para: ${formatedAddress}`
    );
  }
}

