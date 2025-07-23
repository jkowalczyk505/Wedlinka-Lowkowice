// src/components/admin/orders/OrdersTable.jsx
import OrderRow from "./OrderRow";
import { ORDER_STATUS_KEYS, statusToPL } from "../../../utils/orderStatus";
import {
  PAYMENT_STATUS_KEYS,
  paymentStatusToPL,
} from "../../../utils/paymentStatus";

export default function OrdersTable({
  orders,
  onOrderStatusChange,
  onPaymentStatusChange,
}) {
  return (
    <table className="table admin-table">
      <thead>
        <tr>
          <th>Numer</th>
          <th>Data</th>
          <th>Kwota</th>
          <th>Wysyłka</th>
          <th>Płatność</th>
          <th>Status płatności</th>
          <th>Status zamówienia</th>
          <th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <OrderRow
            key={o.id}
            order={o}
            onOrderStatusChange={onOrderStatusChange}
            onPaymentStatusChange={onPaymentStatusChange}
            ORDER_STATUS_KEYS={ORDER_STATUS_KEYS}
            PAYMENT_STATUS_KEYS={PAYMENT_STATUS_KEYS}
            statusToPL={statusToPL}
            paymentStatusToPL={paymentStatusToPL}
          />
        ))}
      </tbody>
    </table>
  );
}
