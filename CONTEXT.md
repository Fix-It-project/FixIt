# FixIt Context

## Glossary

- **Order**: A customer booking assigned to one technician for one service, scheduled into a fixed Cairo time slot.
- **Payment method**: The customer choice made at booking time. Valid values are `cash` and `card`.
- **Cash order**: An order whose `payment_method` is `cash`. After both sides confirm completion, the order completes immediately and a paid off-site cash payment row is recorded.
- **Card order**: An order whose `payment_method` is `card`. After both sides confirm completion, the order moves to `awaiting_payment` and the user opens a Paymob checkout session.
- **Awaiting payment**: The card-only state after dual completion. It ends through a successful Paymob webhook or the user's `switch-to-cash` fallback.
- **Switch to cash**: User fallback for a stuck card checkout. It cancels pending card payment state, records a paid cash row, and completes the order.
- **Inspection fee**: Distance-based fee snapshot taken when an order is submitted. It is included in `final_price` after quote acceptance.
- **Work price**: Negotiated price for the repair work, excluding the inspection fee.
- **Final price**: `work_price + inspection_fee`; this is the payable gross amount.
- **Platform fee**: Card-only percentage configured by `PAYMOB_PLATFORM_FEE_PERCENT`. Cash rows use `0`.
- **Technician net amount**: Technician earnings after platform fee. For cash, this equals the gross amount.
- **Wallet entry**: A paid payment row shown to the technician. Cash rows are treated as paid out; card rows are pending settlement.
- **Paymob Intention**: The Paymob session created by `POST /user/orders/:id/card-session`, using `special_reference = fixit-payment-<paymentId>` so webhooks can resolve the payment row.

## Payment Flow

1. `POST /api/orders/user/orders` requires `payment_method`.
2. The submit RPC stores `orders.payment_method` and creates the initial payment lifecycle state.
3. Dual completion branches by method:
   - `cash` completes the order and records a paid cash payment row.
   - `card` moves to `awaiting_payment`.
4. Card checkout calls Paymob's Intention API and opens unified checkout.
5. A successful Paymob webhook marks the payment paid and completes the order.
6. If card payment stalls, the user can call `switch-to-cash`.
