import RepositoryInterface from "../../@shared/repository/repository-interface";
import Order from "../entity/order";

export default interface OrderRepositoryInterface extends RepositoryInterface<Order> {
    findByCustomerId(customerId: string): Promise<Order[]>;
    updateItems(entity: Order): Promise<void>;
}