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
