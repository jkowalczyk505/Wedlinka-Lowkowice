// src/components/admin/orders/OrderRow.jsx
import { Link } from "react-router-dom";
import Button from "../../common/Button";
import { formatGrossPrice } from "../../../utils/product";
import { shippingToPL } from "../../../utils/shippingMethod";
import { paymentMethodToPL } from "../../../utils/paymentMethod";

export default function OrderRow({
  order,
  onOrderStatusChange,
  onPaymentStatusChange,
  ORDER_STATUS_KEYS,
  PAYMENT_STATUS_KEYS,
  statusToPL,
  paymentStatusToPL,
}) {
  return (
    <tr>
      <td>
        <Link to={`/admin/orders/${order.id}`}>{order.order_number}</Link>
      </td>
      <td>{new Date(order.created_at).toLocaleString()}</td>
      <td>{formatGrossPrice(order.total_brut)} zł</td>
      <td>{shippingToPL(order.shipping_method)}</td>
      <td>
        {order.payment_method ? paymentMethodToPL(order.payment_method) : "-"}
      </td>
      <td>
        <select
          value={order.payment_status}
          onChange={(e) => onPaymentStatusChange(order.id, e.target.value)}
        >
          {PAYMENT_STATUS_KEYS.map((k) => (
            <option key={k} value={k}>
              {paymentStatusToPL(k)}
            </option>
          ))}
        </select>
      </td>
      <td>
        <select
          value={order.order_status}
          onChange={(e) => onOrderStatusChange(order.id, e.target.value)}
        >
          {ORDER_STATUS_KEYS.map((k) => (
            <option key={k} value={k}>
              {statusToPL(k)}
            </option>
          ))}
        </select>
      </td>
      <td>
        <Button
          onClick={() => onOrderStatusChange(order.id, order.order_status)}
        >
          Zapisz
        </Button>
      </td>
    </tr>
  );
}
