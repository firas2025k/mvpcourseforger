# terminal error
Error: Route "/api/stripe/create-checkout-session" used `cookies().get('sb-afaynkhbdbwpmaeimksa-auth-token.4')`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at Object.get (app/api/stripe/create-checkout-session/route.ts:16:29)
    at getWithHints (../../src/cookies.ts:75:38)
    at async getAll (../../src/cookies.ts:89:44)
    at async Object.getItem (../../src/cookies.ts:326:27)
    at async getItemAsync (../../../src/lib/helpers.ts:129:16)
    at async SupabaseAuthClient.__loadSession (../../src/GoTrueClient.ts:1105:27)
    at async SupabaseAuthClient._useSession (../../src/GoTrueClient.ts:1063:21)
  14 |       cookies: {
  15 |         get(name: string) {
> 16 |           return cookieStore.get(name)?.value;
     |                             ^
  17 |         },
  18 |         set(name: string, value: string, options: CookieOptions) {
  19 |           tempHttpResponse.cookies.set(name, value, options);
 POST /api/stripe/create-checkout-session 200 in 3163ms
 GET /dashboard?session_id=cs_test_a1fVqyv9Sg8Z11FtJam7UxL9OrxAQqWRAxEdmKKlDVRkbSTJIappROBV3i 200 in 1000ms

# ngrok logs

{
    "id": "evt_1RY5PYFfX5n10EQsWf2wdh4H",
    "object": "event",
    "api_version": "2023-10-16",
    "created": 1749474407,
    "data": {
        "object": {
            "id": "in_1RY5PVFfX5n10EQs3f7maDHe",
            "object": "invoice",
            "account_country": "US",
            "account_name": "FIRAS BEN TALEB",
            "account_tax_ids": null,
            "amount_due": 1000,
            "amount_overpaid": 0,
            "amount_paid": 1000,
            "amount_remaining": 0,
            "amount_shipping": 0,
            "application": null,
            "application_fee_amount": null,
            "attempt_count": 1,
            "attempted": true,
            "auto_advance": false,
            "automatic_tax": {
                "disabled_reason": null,
                "enabled": false,
                "liability": null,
                "provider": null,
                "status": null
            },
            "automatically_finalizes_at": null,
            "billing_reason": "subscription_create",
            "charge": "ch_3RY5PVFfX5n10EQs0lqTicrK",
            "collection_method": "charge_automatically",
            "created": 1749474405,
            "currency": "usd",
            "custom_fields": null,
            "customer": "cus_ST1RtHydC4cdb5",
            "customer_address": null,
            "customer_email": "firasbentalebdev@gmail.com",
            "customer_name": null,
            "customer_phone": null,
            "customer_shipping": null,
            "customer_tax_exempt": "none",
            "customer_tax_ids": [],
            "default_payment_method": null,
            "default_source": null,
            "default_tax_rates": [],
            "description": null,
            "discount": null,
            "discounts": [],
            "due_date": null,
            "effective_at": 1749474405,
            "ending_balance": 0,
            "footer": null,
            "from_invoice": null,
            "hosted_invoice_url": "https://invoice.stripe.com/i/acct_1OiPDNFfX5n10EQs/test_YWNjdF8xT2lQRE5GZlg1bjEwRVFzLF9TVDFTVjQwcU90MlBtTkFFQUY0dTJTeERYaXRkallHLDE0MDAxNTIwOA0200ONWgRbsb?s=ap",
            "invoice_pdf": "https://pay.stripe.com/invoice/acct_1OiPDNFfX5n10EQs/test_YWNjdF8xT2lQRE5GZlg1bjEwRVFzLF9TVDFTVjQwcU90MlBtTkFFQUY0dTJTeERYaXRkallHLDE0MDAxNTIwOA0200ONWgRbsb/pdf?s=ap",
            "issuer": {
                "type": "self"
            },
            "last_finalization_error": null,
            "latest_revision": null,
            "lines": {
                "object": "list",
                "data": [
                    {
                        "id": "il_1RY5PVFfX5n10EQsDzHqKQbj",
                        "object": "line_item",
                        "amount": 1000,
                        "amount_excluding_tax": 1000,
                        "currency": "usd",
                        "description": "1 × Basic Plan (at $10.00 / month)",
                        "discount_amounts": [],
                        "discountable": true,
                        "discounts": [],
                        "invoice": "in_1RY5PVFfX5n10EQs3f7maDHe",
                        "livemode": false,
                        "metadata": {},
                        "parent": {
                            "invoice_item_details": null,
                            "subscription_item_details": {
                                "invoice_item": null,
                                "proration": false,
                                "proration_details": {
                                    "credited_items": null
                                },
                                "subscription": "sub_1RY5PUFfX5n10EQsOHblzucB",
                                "subscription_item": "si_ST1SYp9eHIs7zU"
                            },
                            "type": "subscription_item_details"
                        },
                        "period": {
                            "end": 1752066404,
                            "start": 1749474404
                        },
                        "plan": {
                            "id": "price_1RUVl6FfX5n10EQsLjS0Rndk",
                            "object": "plan",
                            "active": true,
                            "aggregate_usage": null,
                            "amount": 1000,
                            "amount_decimal": "1000",
                            "billing_scheme": "per_unit",
                            "created": 1748622376,
                            "currency": "usd",
                            "interval": "month",
                            "interval_count": 1,
                            "livemode": false,
                            "metadata": {},
                            "meter": null,
                            "nickname": null,
                            "product": "prod_SPKPZ453LZJHUc",
                            "tiers_mode": null,
                            "transform_usage": null,
                            "trial_period_days": null,
                            "usage_type": "licensed"
                        },
                        "pretax_credit_amounts": [],
                        "price": {
                            "id": "price_1RUVl6FfX5n10EQsLjS0Rndk",
                            "object": "price",
                            "active": true,
                            "billing_scheme": "per_unit",
                            "created": 1748622376,
                            "currency": "usd",
                            "custom_unit_amount": null,
                            "livemode": false,
                            "lookup_key": null,
                            "metadata": {},
                            "nickname": null,
                            "product": "prod_SPKPZ453LZJHUc",
                            "recurring": {
                                "aggregate_usage": null,
                                "interval": "month",
                                "interval_count": 1,
                                "meter": null,
                                "trial_period_days": null,
                                "usage_type": "licensed"
                            },
                            "tax_behavior": "unspecified",
                            "tiers_mode": null,
                            "transform_quantity": null,
                            "type": "recurring",
                            "unit_amount": 1000,
                            "unit_amount_decimal": "1000"
                        },
                        "pricing": {
                            "price_details": {
                                "price": "price_1RUVl6FfX5n10EQsLjS0Rndk",
                                "product": "prod_SPKPZ453LZJHUc"
                            },
                            "type": "price_details",
                            "unit_amount_decimal": "1000"
                        },
                        "proration": false,
                        "proration_details": {
                            "credited_items": null
                        },
                        "quantity": 1,
                        "subscription": "sub_1RY5PUFfX5n10EQsOHblzucB",
                        "subscription_item": "si_ST1SYp9eHIs7zU",
                        "tax_amounts": [],
                        "tax_rates": [],
                        "taxes": [],
                        "type": "subscription",
                        "unit_amount_excluding_tax": "1000"
                    }
                ],
                "has_more": false,
                "total_count": 1,
                "url": "/v1/invoices/in_1RY5PVFfX5n10EQs3f7maDHe/lines"
            },
            "livemode": false,
            "metadata": {},
            "next_payment_attempt": null,
            "number": "NZMDDHFX-0001",
            "on_behalf_of": null,
            "paid": true,
            "paid_out_of_band": false,
            "parent": {
                "quote_details": null,
                "subscription_details": {
                    "metadata": {},
                    "subscription": "sub_1RY5PUFfX5n10EQsOHblzucB"
                },
                "type": "subscription_details"
            },
            "payment_intent": "pi_3RY5PVFfX5n10EQs0qblvZAg",
            "payment_settings": {
                "default_mandate": null,
                "payment_method_options": {
                    "acss_debit": null,
                    "bancontact": null,
                    "card": {
                        "request_three_d_secure": "automatic"
                    },
                    "customer_balance": null,
                    "konbini": null,
                    "sepa_debit": null,
                    "us_bank_account": null
                },
                "payment_method_types": [
                    "card"
                ]
            },
            "period_end": 1749474404,
            "period_start": 1749474404,
            "post_payment_credit_notes_amount": 0,
            "pre_payment_credit_notes_amount": 0,
            "quote": null,
            "receipt_number": null,
            "rendering": null,
            "rendering_options": null,
            "shipping_cost": null,
            "shipping_details": null,
            "starting_balance": 0,
            "statement_descriptor": null,
            "status": "paid",
            "status_transitions": {
                "finalized_at": 1749474405,
                "marked_uncollectible_at": null,
                "paid_at": 1749474407,
                "voided_at": null
            },
            "subscription": "sub_1RY5PUFfX5n10EQsOHblzucB",
            "subscription_details": {
                "metadata": {}
            },
            "subtotal": 1000,
            "subtotal_excluding_tax": 1000,
            "tax": null,
            "test_clock": null,
            "total": 1000,
            "total_discount_amounts": [],
            "total_excluding_tax": 1000,
            "total_pretax_credit_amounts": [],
            "total_tax_amounts": [],
            "total_taxes": [],
            "transfer_data": null,
            "webhooks_delivered_at": 1749474405
        }
    },
    "livemode": false,
    "pending_webhooks": 2,
    "request": {
        "id": null,
        "idempotency_key": "05fb955b-0e4c-4b93-9391-e4079a7b5d76"
    },
    "type": "invoice.payment_succeeded"
}
{
    "id": "evt_1RY85uFfX5n10EQszLDeAbWv",
    "object": "event",
    "api_version": "2023-10-16",
    "created": 1749484721,
    "data": {
        "object": {
            "id": "cs_test_a1fVqyv9Sg8Z11FtJam7UxL9OrxAQqWRAxEdmKKlDVRkbSTJIappROBV3i",
            "object": "checkout.session",
            "adaptive_pricing": null,
            "after_expiration": null,
            "allow_promotion_codes": null,
            "amount_subtotal": 2500,
            "amount_total": 2500,
            "automatic_tax": {
                "enabled": false,
                "liability": null,
                "provider": null,
                "status": null
            },
            "billing_address_collection": null,
            "cancel_url": "http://localhost:3000/pricing",
            "client_reference_id": null,
            "client_secret": null,
            "collected_information": {
                "shipping_details": null
            },
            "consent": null,
            "consent_collection": null,
            "created": 1749484702,
            "currency": "usd",
            "currency_conversion": null,
            "custom_fields": [],
            "custom_text": {
                "after_submit": null,
                "shipping_address": null,
                "submit": null,
                "terms_of_service_acceptance": null
            },
            "customer": "cus_ST1RtHydC4cdb5",
            "customer_creation": null,
            "customer_details": {
                "address": {
                    "city": null,
                    "country": "TN",
                    "line1": null,
                    "line2": null,
                    "postal_code": null,
                    "state": null
                },
                "email": "firasbentalebdev@gmail.com",
                "name": "firas bentameb",
                "phone": null,
                "tax_exempt": "none",
                "tax_ids": []
            },
            "customer_email": null,
            "discounts": [],
            "expires_at": 1749571102,
            "invoice": "in_1RY85qFfX5n10EQsrKnAjMSC",
            "invoice_creation": null,
            "livemode": false,
            "locale": null,
            "metadata": {
                "supabase_user_id": "97a00cf3-34ee-4249-9076-fd8312229244",
                "app_plan_id": "f0ecbb70-f3b8-4493-865b-1cf26c47de2a"
            },
            "mode": "subscription",
            "payment_intent": null,
            "payment_link": null,
            "payment_method_collection": "always",
            "payment_method_configuration_details": null,
            "payment_method_options": {
                "card": {
                    "request_three_d_secure": "automatic"
                }
            },
            "payment_method_types": [
                "card"
            ],
            "payment_status": "paid",
            "permissions": null,
            "phone_number_collection": {
                "enabled": false
            },
            "recovered_from": null,
            "saved_payment_method_options": {
                "allow_redisplay_filters": [
                    "always"
                ],
                "payment_method_remove": "disabled",
                "payment_method_save": null
            },
            "setup_intent": null,
            "shipping_address_collection": null,
            "shipping_cost": null,
            "shipping_details": null,
            "shipping_options": [],
            "status": "complete",
            "submit_type": null,
            "subscription": "sub_1RY85qFfX5n10EQsq6dWxy4Q",
            "success_url": "http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}",
            "total_details": {
                "amount_discount": 0,
                "amount_shipping": 0,
                "amount_tax": 0
            },
            "ui_mode": "hosted",
            "url": null,
            "wallet_options": null
        }
    },
    "livemode": false,
    "pending_webhooks": 3,
    "request": {
        "id": null,
        "idempotency_key": null
    },
    "type": "checkout.session.completed"
}