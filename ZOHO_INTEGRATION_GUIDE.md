# Zoho Forms Integration Guide — Sri Villa Room Management

This guide provides step-by-step instructions for integrating **Zoho Forms** with the **Sri Villa Guest House Management System** (Next.js + Supabase).

---

## Table of Contents
1. [Which Integration Method to Choose?](#1-which-integration-method-to-choose)
2. [Method 1: Webhook Integration (Recommended)](#2-method-1-webhook-integration-recommended)
   - [Required Keys](#required-keys-webhook)
   - [Step-by-Step Zoho Forms Webhook Setup](#step-by-step-zoho-forms-webhook-setup)
   - [Field Mapping Table](#field-mapping-table)
3. [Method 2: Zoho OAuth 2.0 API (For Pulling Data & Two-Way Sync)](#3-method-2-zoho-oauth-20-api-for-pulling-data--two-way-sync)
   - [Required Keys](#required-keys-oauth)
   - [How to Get Client ID & Client Secret from Zoho API Console](#how-to-get-client-id--client-secret-from-zoho-api-console)
   - [How to Generate the Refresh Token](#how-to-generate-the-refresh-token)
4. [Form Fields to Create in Zoho Forms](#4-form-fields-to-create-in-zoho-forms)
5. [Environment Variables Setup (.env & Vercel)](#5-environment-variables-setup-env--vercel)
6. [Database Schema Alignment](#6-database-schema-alignment)
7. [Testing & Troubleshooting](#7-testing--troubleshooting)

---

## 1. Which Integration Method to Choose?

| Feature | Method 1: Webhooks (Recommended) | Method 2: OAuth 2.0 REST API |
| :--- | :--- | :--- |
| **Speed** | Instant / Real-Time (Triggers on Submit) | Pull on demand or Polling |
| **Setup Complexity** | **Very Simple** (5 minutes) | Moderate (OAuth tokens, refresh flows) |
| **Credentials Needed** | 1 Secret Token (`ZOHO_WEBHOOK_SECRET`) | 4 keys (Client ID, Secret, Refresh Token, Scopes) |
| **Token Expiry** | Never expires | Access token expires every hour (needs refresh) |
| **Best For** | Receiving accommodation requests automatically | Pulling past form submissions or editing entries in Zoho |

> **Recommendation:** Use **Method 1 (Webhooks)**. It requires zero token management, never expires, and sends requests instantly to Sri Villa the moment a guest submits the form.

---

## 2. Method 1: Webhook Integration (Recommended)

### Required Keys (Webhook)

Only **one key** is required for webhook security:

| Environment Variable | Description | Where to generate it |
| :--- | :--- | :--- |
| `ZOHO_WEBHOOK_SECRET` | A secret passphrase you create to verify requests originate from your Zoho Form | Generate any random secure string (e.g. `openssl rand -hex 24` or any random password) |

---

### Step-by-Step Zoho Forms Webhook Setup

#### Step 1: Open Your Form in Zoho Forms
1. Log in to [forms.zoho.in](https://forms.zoho.in) (or [forms.zoho.com](https://forms.zoho.com) depending on your region).
2. Open your **Accommodation Request Form** (or create one using the fields in [Section 4](#4-form-fields-to-create-in-zoho-forms)).

#### Step 2: Navigate to Webhook Settings
1. Click the **Settings** tab in the top navigation bar.
2. In the left sidebar, click **Integrations**.
3. Select **Webhooks** and click **Configure Webhook** (or **Add Webhook**).

#### Step 3: Fill Out the Webhook Configuration
- **Webhook Name:** `Sri Villa Accommodation Sync`
- **URL to be notified:**
  - **Live (Production):** `https://your-domain.vercel.app/api/webhooks/zoho-forms`
  - **Local Development:** `https://your-tunnel-id.ngrok-free.app/api/webhooks/zoho-forms`
- **Method:** `POST`
- **Content Type:** `application/json`

#### Step 4: Add Authentication Header
Under **Headers**, add a custom header:
- **Header Name:** `X-Zoho-Webhook-Secret`
- **Header Value:** `<YOUR_SECRET_STRING>` *(This must match `ZOHO_WEBHOOK_SECRET` in your `.env` and Vercel)*

#### Step 5: Map Form Parameters
Under **Parameters (Key-Value pairs)**, map each JSON key to the form field:

| Key (JSON Property) | Value (Zoho Form Placeholder) | Description |
| :--- | :--- | :--- |
| `submission_id` | `${Record.ID}` or `${RecordId}` | Unique Zoho submission reference |
| `guest_name` | Select your **Full Name** field | Name of the requesting guest |
| `guest_phone` | Select your **Phone Number** field | Contact phone |
| `guest_email` | Select your **Email** field | Optional email |
| `num_guests` | Select your **Number of Guests** field | Occupant count |
| `room_type` | Select your **Room Type** field | Preference: AC / Non-AC / Dormitory |
| `checkin_date` | Select your **Expected Check-in** field | Arrival date/time |
| `checkout_date` | Select your **Expected Check-out** field | Departure date/time |
| `purpose` | Select your **Purpose of Visit** field | Reason for visit |
| `notes` | Select your **Special Requests** field | Notes / special needs |

#### Step 6: Save and Enable
Click **Save**. Ensure the webhook toggle is switched **ON** (Active).

---

## 3. Method 2: Zoho OAuth 2.0 API (For Pulling Data & Two-Way Sync)

If you need to query past submissions, download attachments, or update Zoho Forms entries directly from Sri Villa, you need Zoho OAuth 2.0 API credentials.

### Required Keys (OAuth)

| Key Name | Description | Example |
| :--- | :--- | :--- |
| `ZOHO_CLIENT_ID` | OAuth Client ID | `1000.XXXXXXXXXXXX` |
| `ZOHO_CLIENT_SECRET` | OAuth Client Secret | `XXXXXXXXXXXXXXXX` |
| `ZOHO_REFRESH_TOKEN` | Long-lived refresh token to generate access tokens | `1000.XXXXXXXX.XXXXXXXX` |
| `ZOHO_ACCOUNTS_URL` | Accounts domain for your country | `https://accounts.zoho.in` (India) or `https://accounts.zoho.com` (US) |
| `ZOHO_API_DOMAIN` | API domain | `https://forms.zoho.in` (India) or `https://forms.zoho.com` (US) |

---

### How to Get Client ID & Client Secret from Zoho API Console

#### Step 1: Open Zoho API Console
1. Go to:
   - **India accounts:** [https://api-console.zoho.in](https://api-console.zoho.in)
   - **Global/US accounts:** [https://api-console.zoho.com](https://api-console.zoho.com)
2. Log in with your Zoho admin account.

#### Step 2: Add a Client Application
1. Click **Add Client** (or **GET STARTED** if first time).
2. Choose **Server-based Applications** (click *Create Now*).
3. Fill in the client details:
   - **Client Name:** `Sri Villa Management`
   - **Homepage URL:** `https://your-domain.vercel.app` (or `http://localhost:3000`)
   - **Authorized Redirect URIs:** `https://your-domain.vercel.app/api/auth/zoho/callback` (or `http://localhost:3000/api/auth/zoho/callback`)
4. Click **CREATE**.

#### Step 3: Copy Your Keys
- You will see:
  - **Client ID** (e.g. `1000.A1B2C3...`)
  - **Client Secret** (e.g. `d4e5f6...`)
- Save these in your notes.

---

### How to Generate the Refresh Token

To allow Sri Villa to talk to Zoho API indefinitely in the background without user login prompts:

#### Option A: Using Self-Client (Quickest & Easiest)
1. In the same Zoho API Console, click on your client application.
2. Select the **Generate Code** tab (or **Self-Client**).
3. In **Scope**, enter:
   ```
   ZohoForms.forms.READ,ZohoForms.entries.READ,ZohoForms.entries.CREATE
   ```
4. In **Time Duration**, select **10 minutes**.
5. In **Scope Description**, enter `Sri Villa Integration`.
6. Click **Generate Code**. Copy the temporary grant code (e.g. `1000.grant_code_xxxx`).
7. Immediately exchange this grant code for a permanent `refresh_token` using your terminal:

```bash
curl -X POST https://accounts.zoho.in/oauth/v2/token \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://your-domain.vercel.app/api/auth/zoho/callback" \
  -d "code=YOUR_GENERATED_CODE"
```
*(Replace `accounts.zoho.in` with `accounts.zoho.com` if your account is in the US/EU data center).*

8. The JSON response will contain:
```json
{
  "access_token": "1000.xxxx",
  "refresh_token": "1000.xxxx",
  "api_domain": "https://www.zohoapis.in",
  "token_type": "Bearer",
  "expires_in": 3600
}
```
9. Copy the `refresh_token`. It **never expires** unless manually revoked.

---

## 4. Form Fields to Create in Zoho Forms

To match the Sri Villa database schema, set up these fields in your Zoho Form:

| Field Label | Zoho Field Type | Mandatory? | Notes / Allowed Options |
| :--- | :--- | :--- | :--- |
| **Full Name** | Single Line | Yes | Guest's full name |
| **Phone Number** | Phone / Number | Yes | 10-digit mobile number with country code |
| **Email** | Email | No | For confirmation receipts |
| **Number of Guests** | Number / Dropdown | Yes | 1 to 10 occupants |
| **Preferred Room Type** | Dropdown / Radio | Yes | Options: `AC Room`, `Non-AC Room`, `Dormitory` |
| **Expected Check-in Date & Time** | Date-Time | Yes | Arrival estimate |
| **Expected Check-out Date & Time** | Date-Time | Yes | Departure estimate |
| **Purpose of Visit** | Dropdown / Text | No | Options: `Pilgrimage`, `Puja`, `Volunteer`, `Other` |
| **Special Requests / Notes** | Multi Line | No | Ground floor preference, elderly guest assistance, etc. |

---

## 5. Environment Variables Setup (.env & Vercel)

### Local Development (`.env`):
```env
# Supabase Configuration
SUPABASE_URL=https://iwqbcfoqxferysuiwmeq.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Zoho Forms Webhook Secret (Method 1)
ZOHO_WEBHOOK_SECRET=your-secure-random-secret-token

# Optional: Zoho OAuth API (Only if using Method 2)
# ZOHO_CLIENT_ID=1000.XXXXXXXXXX
# ZOHO_CLIENT_SECRET=XXXXXXXXXX
# ZOHO_REFRESH_TOKEN=1000.XXXXXXXXXX
# ZOHO_ACCOUNTS_URL=https://accounts.zoho.in
# ZOHO_API_DOMAIN=https://forms.zoho.in
```

### Vercel Deployment:
1. Go to **Vercel Dashboard** $\rightarrow$ Select your project $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**.
2. Add:
   - `ZOHO_WEBHOOK_SECRET` = `<your-chosen-secret>`
3. Check **Production**, **Preview**, and **Development**.
4. Click **Save** and trigger a **Redeploy**.

---

## 6. Database Schema Alignment

When a webhook arrives, the backend automatically inserts a row into the existing `accommodation_requests` table in Supabase:

```sql
INSERT INTO accommodation_requests (
  guest_name,
  guest_phone,
  guest_email,
  num_guests,
  preferred_room_type,
  preferred_checkin,
  preferred_checkout,
  purpose,
  status,
  source,
  external_reference_id,
  notes
) VALUES (
  'Devotee Name',
  '+91 9876543210',
  'guest@example.com',
  2,
  'ac',                       -- 'ac', 'non_ac', or 'dormitory'
  '2026-10-20T10:00:00Z',
  '2026-10-22T10:00:00Z',
  'Temple Visit',
  'new',                      -- Staff reviews and converts to stay/reservation
  'zoho_forms',               -- Identifies source
  'zoho_submission_12345',    -- Deduplication key
  'Prefers ground floor room'
);
```

---

## 7. Testing & Troubleshooting

### Local Testing with Ngrok
Since Zoho Forms cannot send webhooks to `localhost:3000` directly, use a local tunnel:
```bash
# 1. Install and launch ngrok
npx ngrok http 3000
```
2. Copy the forwarding URL (e.g. `https://a1b2-c3d4.ngrok-free.app`).
3. In Zoho Forms Webhook settings, set:
   `https://a1b2-c3d4.ngrok-free.app/api/webhooks/zoho-forms`
4. Fill and submit the form in your browser.
5. Check your terminal logs to verify receipt.

### Common Issues & Fixes

1. **Webhook Returns 401 Unauthorized**:
   - Check that `X-Zoho-Webhook-Secret` in Zoho Forms matches `ZOHO_WEBHOOK_SECRET` in `.env` / Vercel.
2. **Datacenter Mismatch (`.in` vs `.com`)**:
   - Indian Zoho accounts use `zoho.in` (e.g. `accounts.zoho.in`, `forms.zoho.in`).
   - US accounts use `zoho.com`.
   - If using OAuth, always use the domain matching your Zoho account registration.
3. **Duplicate Submissions**:
   - The backend checks `external_reference_id = submission_id`. Duplicate webhook deliveries will be safely acknowledged with `200 OK` without creating extra rows.
