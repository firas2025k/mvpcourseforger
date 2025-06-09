# terminal response 
Webhook: Received event: checkout.session.completed
Webhook: Processing checkout.session.completed for user 97a00cf3-34ee-4249-9076-fd8312229244, app plan ID f0ecbb70-f3b8-4493-865b-1cf26c47de2a
Webhook Helper: Updating for User ID: 97a00cf3-34ee-4249-9076-fd8312229244, App Plan ID: f0ecbb70-f3b8-4493-865b-1cf26c47de2a, Active: true
Webhook Helper: Found plan "Pro" with course limit 15
Webhook Helper: Upserting subscription data: {
  "user_id": "97a00cf3-34ee-4249-9076-fd8312229244",
  "plan_id": "f0ecbb70-f3b8-4493-865b-1cf26c47de2a",
  "is_active": true,
  "stripe_customer_id": "cus_ST1RtHydC4cdb5",
  "stripe_subscription_id": "sub_1RY85qFfX5n10EQsq6dWxy4Q",
  "stripe_current_period_end": "2025-07-09T15:58:38.000Z"
}
Webhook Helper: Subscription upserted for user 97a00cf3-34ee-4249-9076-fd8312229244. Now updating profile course limit.
Webhook: Successfully updated subscription and course limit for user 97a00cf3-34ee-4249-9076-fd8312229244 to plan f0ecbb70-f3b8-4493-865b-1cf26c47de2a (Pro). Active: true, Course Limit: 15
 POST /api/stripe/webhook 200 in 1721ms

# subscriptions querry
[
  {
    "id": "b8a560a2-13bd-4299-bd78-7a34ea5798b2",
    "user_id": "97a00cf3-34ee-4249-9076-fd8312229244",
    "plan_id": "f0ecbb70-f3b8-4493-865b-1cf26c47de2a",
    "is_active": true,
    "start_date": "2025-06-09 13:06:02.799911+00",
    "end_date": null,
    "stripe_customer_id": "cus_ST1RtHydC4cdb5",
    "stripe_subscription_id": "sub_1RY85qFfX5n10EQsq6dWxy4Q",
    "created_at": "2025-06-09 13:06:02.799911+00",
    "stripe_current_period_end": "2025-07-09 15:58:38+00"
  }
]
# users querry
[
  {
    "course_limit": 15
  }
]