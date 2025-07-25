import React, { useState } from "react";
import OrderRow from "./OrderRow";
import OrderDetailsAdmin from "./OrderDetailsAdmin";
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
  const [openOrderId, setOpenOrderId] = useState(null); // ← DODAJ

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
        {orders.map((order) => (
          <React.Fragment key={order.id}>
            <OrderRow
              order={order}
              onOrderStatusChange={onOrderStatusChange}
              onPaymentStatusChange={onPaymentStatusChange}
              ORDER_STATUS_KEYS={ORDER_STATUS_KEYS}
              PAYMENT_STATUS_KEYS={PAYMENT_STATUS_KEYS}
              statusToPL={statusToPL}
              paymentStatusToPL={paymentStatusToPL}
              onToggle={(id) =>
                setOpenOrderId((prev) => (prev === id ? null : id))
              }
              isOpen={openOrderId === order.id}
            />
            {openOrderId === order.id && (
              <tr className="order-details-row">
                <td colSpan="100%">
                  <OrderDetailsAdmin id={order.id} />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
