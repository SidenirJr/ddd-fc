import EventDispatcherInterface from "../../@shared/event/event-dispatcher.interface";
import EventInterface from "../../@shared/event/event.interface";
import CustomerAddressChangedEvent from "../event/customer-address-changed.event";
import CustomerCreatedEvent from "../event/customer-created.event";
import Address from "../value-object/address";

export default class Customer {
  static eventDispatcher?: EventDispatcherInterface;
  private _id: string;
  private _name: string = "";
  private _address!: Address;
  private _active: boolean = false;
  private _rewardPoints: number = 0;

  constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
    this.validate();
    this.dispatchCustomerCreatedEvent();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get rewardPoints(): number {
    return this._rewardPoints;
  }

  validate() {
    if (this._id.length === 0) {
      throw new Error("Id is required");
    }
    if (this._name.length === 0) {
      throw new Error("Name is required");
    }
  }

  changeName(name: string) {
    this._name = name;
    this.validate();
  }

  get Address(): Address {
    return this._address;
  }
  
  changeAddress(address: Address) {
    this._address = address;
    this.dispatchCustomerAddressChangedEvent(address);
  }

  isActive(): boolean {
    return this._active;
  }

  activate() {
    if (this._address === undefined) {
      throw new Error("Address is mandatory to activate a customer");
    }
    this._active = true;
  }

  deactivate() {
    this._active = false;
  }

  addRewardPoints(points: number) {
    this._rewardPoints += points;
  }

  set Address(address: Address) {
    this._address = address;
  }

  private dispatchEvent(event: EventInterface): void {
    Customer.eventDispatcher?.notify(event);
  }

  private dispatchCustomerCreatedEvent(): void {
    this.dispatchEvent(
      new CustomerCreatedEvent({
        id: this._id,
        name: this._name,
      })
    );
  }

  private dispatchCustomerAddressChangedEvent(address: Address): void {
    this.dispatchEvent(
      new CustomerAddressChangedEvent({
        id: this._id,
        name: this._name,
        address: {
          street: address.street,
          number: address.number,
          zip: address.zip,
          city: address.city,
        },
      })
    );
  }
}
