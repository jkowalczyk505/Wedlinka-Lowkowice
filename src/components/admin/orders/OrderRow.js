import { useState } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [tempOrderStatus, setTempOrderStatus] = useState(order.order_status);
  const [tempPaymentStatus, setTempPaymentStatus] = useState(
    order.payment_status
  );

  const cancelEdit = () => {
    setTempOrderStatus(order.order_status);
    setTempPaymentStatus(order.payment_status);
    setIsEditing(false);
  };

  const saveChanges = () => {
    if (tempOrderStatus !== order.order_status) {
      onOrderStatusChange(order.id, tempOrderStatus);
    }
    if (tempPaymentStatus !== order.payment_status) {
      onPaymentStatusChange(order.id, tempPaymentStatus);
    }
    setIsEditing(false);
  };

  return (
    <tr>
      <td>
        <Link to={`/admin/orders/${order.id}`}>{order.order_number}</Link>
      </td>
      <td>{new Date(order.created_at).toLocaleString()}</td>
      <td>
        {formatGrossPrice(
          Number(order.total_brut) + Number(order.shipping_cost || 0)
        )}{" "}
        zł
      </td>

      <td>{shippingToPL(order.shipping_method)}</td>
      <td>
        {order.payment_method ? paymentMethodToPL(order.payment_method) : "-"}
      </td>
      <td>
        {isEditing ? (
          <select
            value={tempPaymentStatus}
            onChange={(e) => setTempPaymentStatus(e.target.value)}
          >
            {PAYMENT_STATUS_KEYS.map((k) => (
              <option key={k} value={k}>
                {paymentStatusToPL(k)}
              </option>
            ))}
          </select>
        ) : (
          paymentStatusToPL(order.payment_status)
        )}
      </td>
      <td>
        {isEditing ? (
          <select
            value={tempOrderStatus}
            onChange={(e) => setTempOrderStatus(e.target.value)}
          >
            {ORDER_STATUS_KEYS.map((k) => (
              <option key={k} value={k}>
                {statusToPL(k)}
              </option>
            ))}
          </select>
        ) : (
          statusToPL(order.order_status)
        )}
      </td>
      <td>
        {isEditing ? (
          <>
            <Button onClick={saveChanges}>Zapisz</Button>
            <Button onClick={cancelEdit} variant="secondary">
              Anuluj
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edytuj</Button>
        )}
      </td>
    </tr>
  );
}
