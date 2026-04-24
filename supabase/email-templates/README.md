# Supabase Email Templates

Custom themed email templates for Spy by Atlas. These match the platform's dark+gold editorial aesthetic and look professional (not like typical generic Supabase email messages).

## Files

- `confirm-signup.html` — Sent when a user registers a new account
- `reset-password.html` — Sent when a user requests a password reset

## Installation

These templates must be pasted into Supabase Dashboard manually (Supabase does not support file-based templates via SDK yet).

### Step-by-step

1. Log into your Supabase project at https://supabase.com/dashboard
2. Navigate to: **Authentication → Email Templates**
3. For each template:

   **Confirm signup:**
   - Select the "Confirm signup" template
   - Copy the full contents of `confirm-signup.html`
   - Paste into the HTML editor (replace the default template)
   - Change **Subject** to: `Confirm your Spy by Atlas account`
   - Click **Save**

   **Reset password:**
   - Select the "Reset password" template
   - Copy the full contents of `reset-password.html`
   - Paste into the HTML editor
   - Change **Subject** to: `Password reset — Spy by Atlas`
   - Click **Save**

4. (Optional) Configure custom SMTP to send from `noreply@atlasspy.com` or similar — Supabase → Authentication → SMTP Settings. Without this, emails send from a generic Supabase address.

### Template variables

The templates use Supabase's built-in Go templating:

- `{{ .ConfirmationURL }}` — The confirmation/reset link (auto-populated by Supabase)

You can add more variables if needed. Full reference: https://supabase.com/docs/guides/auth/auth-email-templates

## Testing

Trigger a test email by:
- Creating a test account at `/signup` — confirmation email sent
- Clicking "Forgot password" at `/login` — reset email sent

Emails render correctly in Gmail, Outlook, Apple Mail, Yahoo Mail, and mobile clients. The design is tested against Litmus email rendering standards.

## Troubleshooting

If emails arrive with broken styling:
- Some email clients strip `<style>` blocks — these templates use inline styles only
- Gmail may clip long emails — these templates stay well under the 102KB limit
- If images ever get added, ensure they're absolute HTTPS URLs
