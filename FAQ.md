### If we create functionality of access token, refresh token so when should we hit route refresh-token.

In an authentication flow using access tokens and refresh tokens, the `refresh-token` route should be called when:

1. **Access Token Expiry**: When the client detects that the access token has expired (e.g., based on a `401 Unauthorized` response or by checking the token's expiry time), it should send a request to the `refresh-token` route to obtain a new access token.

2. **Proactive Refresh**: The client can proactively refresh the token shortly before it expires to ensure uninterrupted access to protected resources. This is usually done by checking the expiration timestamp of the access token and refreshing it a few minutes before it expires.

### Common Flow:
1. **Initial Login**:
   - User logs in, and the server issues both an access token (short-lived) and a refresh token (longer-lived).
2. **API Requests**:
   - The client uses the access token to make authenticated requests to protected routes.
3. **Access Token Expiry**:
   - If the access token expires, the client should hit the `refresh-token` route to exchange the refresh token for a new access token.
4. **Refresh Token Validation**:
   - The server validates the refresh token and, if valid, issues a new access token (and possibly a new refresh token).
5. **Access Token Replacement**:
   - The client receives the new access token and uses it for subsequent requests.

### Important Notes:
- **Security**: Ensure the refresh token is kept secure (e.g., stored in HTTP-only cookies or secure storage).
- **Refresh Token Expiry**: If the refresh token itself expires or is invalidated (e.g., logout or token revocation), the user will need to log in again.

Hitting the `refresh-token` route only when necessary (e.g., when the access token is close to or has expired) optimizes performance and reduces unnecessary server load.


### If my access token is expired in 1 min then what to do after point 5.

If your access token expires in 1 minute, you need to ensure that your client application manages this short expiration period effectively to avoid constant interruptions. Here's what to do after point 5 (where you have replaced the access token):

### Step-by-Step After Point 5:
1. **Monitor Access Token Lifetime**:
   - Implement a timer or a mechanism in your client to monitor the access token's expiry time.
   - For a 1-minute expiry, you should start the process to refresh the token a bit before the actual expiry (e.g., at 50-55 seconds) to avoid gaps in authentication.

2. **Proactively Refresh the Token**:
   - Before the access token expires, proactively call the `refresh-token` route to obtain a new access token without waiting for an API call failure.
   - This can be done using a `setTimeout` or an interval in JavaScript (or a similar approach in other languages).

3. **Replace the Access Token**:
   - After obtaining a new access token, update your client's storage (e.g., `localStorage`, `sessionStorage`, or in-memory storage) with the new token.
   - Ensure that all future requests use this updated token.

### Example Workflow in JavaScript:
```javascript
function startTokenRefreshCycle() {
    const accessTokenExpiry = 60000; // 1 minute (in milliseconds)
    const refreshBufferTime = 50000; // Refresh at 50 seconds (10 seconds before expiry)

    setTimeout(async () => {
        try {
            const newAccessToken = await fetchNewAccessToken(); // Call your `refresh-token` route
            updateClientAccessToken(newAccessToken); // Replace the stored token
            startTokenRefreshCycle(); // Restart the cycle
        } catch (error) {
            console.error('Failed to refresh token:', error);
            // Optionally handle re-login logic here if the refresh fails
        }
    }, refreshBufferTime);
}

function fetchNewAccessToken() {
    return fetch('/refresh-token', {
        method: 'POST',
        credentials: 'include' // if using cookies for refresh token
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }
        return response.json(); // Assuming the new access token is in the response body
    })
    .then(data => data.accessToken);
}

function updateClientAccessToken(newToken) {
    // Update your storage mechanism
    localStorage.setItem('accessToken', newToken);
}

// Start the token refresh cycle when the app is initialized
startTokenRefreshCycle();
```

### Best Practices:
- **Short-lived Access Tokens**: Keep access tokens short-lived for security, but use refresh tokens to maintain a seamless user experience.
- **Error Handling**: Implement proper error handling to detect if a refresh token has expired or is invalid so you can prompt the user to log in again.
- **Secure Storage**: Store access tokens and refresh tokens securely (e.g., in `httpOnly` cookies for refresh tokens).

This approach ensures that your access token is always valid, minimizing downtime and maintaining a smooth user experience.

### what if our access token is for 15 min and refresh token is for 1day. does after every 15 min  our application need to hit refresh-token route to get new access token ? 

Yes, if your access token expires after 15 minutes and your refresh token is valid for 1 day, your application should hit the `refresh-token` route approximately every 15 minutes to obtain a new access token. This is necessary to maintain the user's authenticated session without requiring them to log in again.

### How It Works:
1. **Access Token Usage**:
   - The client uses the access token for authenticated API requests.
   - The access token is valid for 15 minutes.

2. **Refresh Token Logic**:
   - The refresh token is used to obtain a new access token when the current access token expires.
   - The refresh token is valid for a longer duration (e.g., 1 day).

3. **Automatic Refresh Process**:
   - The client application should have a mechanism to detect when the access token is about to expire (e.g., at 13-14 minutes).
   - Before the access token expires, the client proactively calls the `refresh-token` route to get a new access token.
   - This ensures uninterrupted access without requiring user interaction.

### Why Refresh Every 15 Minutes?
- **Security**: Short-lived access tokens limit the impact if they are compromised.
- **User Experience**: Refreshing the token in the background ensures users remain logged in and don't experience disruptions.
- **Resource Management**: By refreshing only when necessary, you minimize load on the server.

### Implementation Strategy:
1. **Monitor Token Expiry**:
   - Track the expiration of the access token using a timer or a `setTimeout` function.
2. **Proactive Refresh**:
   - Set the timer to trigger a token refresh a few minutes before the access token expires (e.g., at 13-14 minutes for a 15-minute token).
3. **Refresh Token Usage**:
   - Use the refresh token to call the `refresh-token` route and obtain a new access token.
4. **Update Token**:
   - Replace the old access token in the client with the new one.

### Example Refresh Logic:
```javascript
function startTokenRefreshCycle() {
    const accessTokenExpiry = 15 * 60 * 1000; // 15 minutes in milliseconds
    const refreshBufferTime = 14 * 60 * 1000; // Refresh at 14 minutes (1 minute before expiry)

    setTimeout(async () => {
        try {
            const newAccessToken = await fetchNewAccessToken(); // Call your `refresh-token` route
            updateClientAccessToken(newAccessToken); // Replace the stored token
            startTokenRefreshCycle(); // Restart the cycle
        } catch (error) {
            console.error('Failed to refresh token:', error);
            // Optionally handle re-login logic here if the refresh fails
        }
    }, refreshBufferTime);
}
```

### When Should the User Re-login?
- If the refresh token expires (after 1 day) or becomes invalid (e.g., if the user logs out or the token is revoked), the user will need to log in again to obtain a new refresh token.

### Benefits:
- **Smooth User Experience**: Users remain logged in without needing to re-authenticate frequently.
- **Security and Flexibility**: A shorter access token lifespan enhances security, while the refresh token maintains session continuity.

By following this strategy, your application efficiently handles token expiration and maintains a seamless user experience.

### HOw this is set to authorization in header in verifyJWT
```js
   const authHeader = req.headers['authorization'];
   console.log(authHeader); // Bearer token
   const token = authHeader.split(' ')[1];
```
The `verifyJWT` middleware function you provided checks for a JWT (JSON Web Token) in the `Authorization` header of incoming requests and verifies it. Here’s how the `Authorization` header is typically set and used:

### Setting the `Authorization` Header in a Request
When making requests to an endpoint that requires authentication, the client must include the `Authorization` header with the `Bearer` token format:
```http
Authorization: Bearer <access_token>
```

### How to Set the Header Programmatically:
In a client-side application or API call (e.g., using JavaScript and `fetch`, `axios`, etc.), you can set the `Authorization` header like this:

**Using `fetch`:**
```javascript
fetch('https://example.com/protected-route', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${accessToken}` // accessToken is your JWT
    }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

**Using `axios`:**
```javascript
axios.get('https://example.com/protected-route', {
    headers: {
        'Authorization': `Bearer ${accessToken}` // accessToken is your JWT
    }
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));
```

### Explanation of Your `verifyJWT` Middleware:
1. **Extract Header**:
   ```javascript
   const authHeader = req.headers['authorization'];
   ```
   This line retrieves the `Authorization` header from the incoming request.

2. **Check for Header**:
   ```javascript
   if (!authHeader) return res.sendStatus(401);
   ```
   If the `Authorization` header is missing, it returns a `401 Unauthorized` status.

3. **Extract Token**:
   ```javascript
   const token = authHeader.split(' ')[1];
   ```
   Splits the `Authorization` header by space and takes the second part (the token after `Bearer`).

4. **Verify Token**:
   ```javascript
   jwt.verify(
       token,
       process.env.ACCESS_TOKEN_SECRET,
       (err, decoded) => {
           if (err) return res.sendStatus(403); // Invalid token
           req.user = decoded.username; // Attach decoded username to `req`
           next(); // Pass control to the next middleware/route handler
       }
   );
   ```

   - `jwt.verify()` verifies the token using the secret key defined in `process.env.ACCESS_TOKEN_SECRET`.
   - If the verification fails (e.g., token is invalid or expired), it sends a `403 Forbidden` status.
   - If successful, it decodes the token payload (e.g., `decoded.username`) and attaches it to `req.user`, then calls `next()` to pass control to the next middleware or route.

### Example of How This Works in a Route:
```javascript
app.get('/protected-route', verifyJWT, (req, res) => {
    res.send(`Hello, ${req.user}. You have access!`);
});
```

When a request hits `/protected-route`, it first goes through the `verifyJWT` middleware. If the token is valid, the request proceeds, and the route handler has access to `req.user`. If the token is invalid or missing, the request is blocked with a `401` or `403` response.