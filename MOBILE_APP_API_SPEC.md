# SwipeBetter Mobile App API Specification

This document outlines the API endpoints and integration requirements for building the SwipeBetter iOS/Android mobile app.

## Base URL

Production: `https://swipebetter.replit.app`
Development: Your local Replit dev URL

## Authentication

The mobile app uses JWT (JSON Web Token) authentication instead of session cookies.

### Headers

For authenticated requests, include:
```
Authorization: Bearer <token>
```

### Social Login Endpoints

#### Sign in with Apple

```http
POST /api/auth/apple
Content-Type: application/json

{
  "identityToken": "eyJ...", // Apple identity token from expo-apple-authentication
  "user": {
    "email": "user@example.com", // Only provided on first sign-in
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Response:**
```json
{
  "token": "eyJ...", // JWT token - store securely
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileImageUrl": null
  }
}
```

#### Sign in with Google

```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "eyJ..." // Google ID token from expo-auth-session
}
```

**Response:**
```json
{
  "token": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileImageUrl": "https://..."
  }
}
```

#### Token Refresh

```http
POST /api/auth/refresh
Authorization: Bearer <current_token>
```

**Response:**
```json
{
  "token": "eyJ...", // New JWT token
  "user": { ... }
}
```

## Profile Analysis

### Analyze Profile (Free for all users)

```http
POST /api/analyze-profile
Content-Type: application/json
Authorization: Bearer <token> // Optional - if provided, saves analysis to history

{
  "platform": "Tinder", // "Tinder" | "Hinge" | "Bumble" | "Grindr" | "Coffee Meets Bagel" | "Other"
  "gender": "Man", // "Man" | "Woman" | "Non-binary"
  "intent": "Relationship", // "Relationship" | "Casual Dating" | "Friendship" | "Not Sure"
  "screenshots": ["data:image/jpeg;base64,..."], // 1-5 base64 images, max 10MB each
  "enm": false // Optional: true for polyamorous/ENM profiles
}
```

**Response (Free/Anonymous User):**
```json
{
  "analysis": {
    "id": null,
    "platform": "Tinder",
    "overallScore": 67,
    "bioSuggestions": "[Upgrade to unlock]",
    "photoFeedback": "[Upgrade to unlock]",
    "improvements": "[Upgrade to unlock]"
  },
  "parsed": {
    "overallScore": 67,
    "bioSuggestions": "[Upgrade to unlock bio suggestions]",
    "photoFeedback": "[Upgrade to unlock photo feedback]",
    "improvements": "[Upgrade to unlock improvement recommendations]"
  },
  "isPaidUser": false
}
```

**Response (Paid User):**
```json
{
  "analysis": { ... }, // Full analysis with all fields
  "parsed": {
    "overallScore": 67,
    "bioSuggestions": "Your bio is too generic...",
    "photoFeedback": "Your first photo has good lighting...",
    "improvements": "1. Add a photo showing your hobbies..."
  },
  "isPaidUser": true
}
```

## Subscription & Payments

### Get Subscription Status

```http
GET /api/subscription
Authorization: Bearer <token>
```

**Response:**
```json
{
  "subscription": {
    "status": "active", // "active" | "inactive"
    "plan": "monthly",
    "oneTimeCredits": 0
  },
  "canAnalyze": true,
  "isSubscribed": true,
  "oneTimeCredits": 0,
  "isPaidUser": true
}
```

### Create Checkout Session (for Stripe)

```http
POST /api/stripe/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "priceId": "price_xxxxx"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..." // Open in in-app browser
}
```

### Get Stripe Products/Prices

```http
GET /api/products
```

**Response:**
```json
{
  "data": [
    {
      "id": "prod_xxx",
      "name": "Pro Monthly",
      "prices": [
        {
          "id": "price_xxx",
          "unit_amount": 999, // cents
          "currency": "usd",
          "interval": "month"
        }
      ]
    }
  ]
}
```

## Mobile-Specific Integration Notes

### Apple Pay / Google Pay

Apple Pay and Google Pay are handled through Stripe's React Native SDK. The flow:

1. Use `@stripe/stripe-react-native` in your mobile app
2. Configure Apple Pay in your Apple Developer account
3. Configure Google Pay in your Google Play Console
4. The mobile SDK handles the native payment sheet
5. After successful payment, call your backend to create the subscription

### Environment Variables Required (Backend)

Add these secrets to your Replit:
- `APPLE_CLIENT_ID` - Your Apple Services ID (e.g., `com.yourapp.web`)
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `JWT_SECRET` - A secure random string for signing tokens (defaults to SESSION_SECRET if not set)

### Expo Setup for Mobile App

Required packages:
```bash
expo install expo-apple-authentication
expo install expo-auth-session expo-crypto
expo install @stripe/stripe-react-native
```

### Example: Sign in with Apple (Expo)

```typescript
import * as AppleAuthentication from 'expo-apple-authentication';

async function signInWithApple() {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const response = await fetch('https://your-api.replit.app/api/auth/apple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identityToken: credential.identityToken,
      user: {
        email: credential.email,
        name: {
          firstName: credential.fullName?.givenName,
          lastName: credential.fullName?.familyName,
        },
      },
    }),
  });

  const { token, user } = await response.json();
  // Store token securely using expo-secure-store
}
```

### Example: Sign in with Google (Expo)

```typescript
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

function GoogleSignIn() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      
      fetch('https://your-api.replit.app/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: id_token }),
      })
      .then(res => res.json())
      .then(({ token, user }) => {
        // Store token securely
      });
    }
  }, [response]);

  return (
    <Button onPress={() => promptAsync()} title="Sign in with Google" />
  );
}
```

### Token Storage

Use `expo-secure-store` to securely store the JWT token:

```typescript
import * as SecureStore from 'expo-secure-store';

async function saveToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token);
}

async function getToken() {
  return await SecureStore.getItemAsync('auth_token');
}
```

## Error Handling

All endpoints return errors in this format:

```json
{
  "message": "Human-readable error message",
  "error": "Error type (optional)",
  "details": {} // Additional details (optional)
}
```

Common HTTP status codes:
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (no permission)
- `500` - Server error

## CORS Configuration

The backend is configured to accept requests from:
- `*.replit.dev`
- `*.replit.app`
- Mobile app requests (no Origin header)

For local development with Expo, requests from the Expo development server should work automatically since React Native doesn't enforce CORS like browsers do.
