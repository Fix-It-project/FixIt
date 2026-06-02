# Notifications Module

Role-scoped device registration endpoints backed by a unified `push_devices`
recipient model and Expo Push Service delivery.

## Routes

- `POST /api/notifications/user/devices/register`
- `POST /api/notifications/user/devices/unregister`
- `POST /api/notifications/technician/devices/register`
- `POST /api/notifications/technician/devices/unregister`

## Body

```json
{
  "expo_push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

## Notes

- Android-only in v1.
- Uses Expo Push Service for delivery.
- Notification publish is best-effort and should never fail the business action.

## Sent Events

Current notification events are triggered from:
- `orders/lifecycle/lifecycle.service.ts`
- `orders/reschedule.service.ts`

### Order lifecycle

1. `order_submitted`
- Recipient: technician
- Title: `New service request`
- Message: `<customer name> sent a new booking request.`

2. `order_accepted`
- Recipient: user
- Title: `Booking accepted`
- Message: `<technician name> accepted your booking request.`

3. `order_declined`
- Recipient: user
- Title: `Booking declined`
- Message: `<technician name> declined your booking request.`

4. `technician_tracking`
- Recipient: user
- Title: `Technician is on the way`
- Message: `<technician name> is on the way to your booking.`

5. `technician_arrived`
- Recipient: user
- Title: `Technician arrived`
- Message: `<technician name> has arrived at the destination.`

6. `order_completed`
- Recipient: user
- Title: `Order completed`
- Message: `<technician name> marked your booking as completed.`

### Reschedule

1. `reschedule_requested`
- Recipient: counterparty
- Title: `Reschedule requested`
- Message: `<customer or technician name> requested a reschedule.`

2. `reschedule_approved`
- Recipient: initiator
- Title: `Reschedule approved`
- Message: `<customer or technician name> approved your reschedule request.`

3. `reschedule_rejected`
- Recipient: initiator
- Title: `Reschedule rejected`
- Message: `<customer or technician name> rejected your reschedule request.`

## Not Sent Yet

These order-domain events do not currently publish push notifications:
- reschedule withdrawn
- quote submitted / accepted / countered
- inspection started / finished
- payment method chosen
- user completion confirmed
- technician completion confirmed
