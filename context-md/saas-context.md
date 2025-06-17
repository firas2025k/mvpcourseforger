# LMS Subscription Plans — Context for Stripe Integration

This file documents the available pricing plans our project. Each plan includes a monthly cost and a course creation limit. This structure is used to configure products and pricing tiers in Stripe and to enforce plan limits within the application logic.

---

## 🆓 Free Plan

- **Name:** Free
- **Monthly Price:** €0
- **Course Limit:** 1
- **Features:**
  - Create up to **1 course**
  - Access your own created courses
  - Limited to basic course generation
  - No access to analytics
  - No custom branding

---

## 💡 Basic Plan

- **Name:** Basic
- **Monthly Price:** €10
- **Course Limit:** 5
- stripe price id: price_1RUVl6FfX5n10EQsLjS0Rndk
- stripe product id: prod_SPKPZ453LZJHUc
- stripe metadata: { course_limit: "5",plan_id: "basic" }
---

## 🚀 Pro Plan

- **Name:** Premium
- **Monthly Price:** €25
- **Course Limit:** 15
- stripe price id: price_1RUVliFfX5n10EQsgYfOlAg1
- stripe product id: prod_SPKQtNCGRCE98X
- stripe metadata: { course_limit: "15",plan_id: "pro" }


---

## 🚀 Ultimate Plan

- **Name:** Ultimate
- **Monthly Price:** €50
- **Course Limit:** 50
- stripe price id: price_1RUVmHFfX5n10EQsFUMfbnWd
- stripe product id: prod_SPKR6JlC3f8LzO
- stripe metadata: { course_limit: "50",plan_id: "ultimate" }


---

| Plan Name    | Max Courses | Max Chapters          | Max LEssons per chapter
| ------------ | ----------- | --------------------- | --------------------- | 
| **Free**     | 1           | **3**                 | **3**                 |
| **Basic**    | 5           | **5**                 | **4**                 | 
| **Pro**      | 15          | **10**                 | **5**                 | 
| **Ultimate** | 50          | **20**                | **10**                 |
