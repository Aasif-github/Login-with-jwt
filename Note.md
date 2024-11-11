## Body Parser
***why we need body parser and is there any other way without body parser.***

`body-parser` is a middleware for Node.js that parses incoming request bodies before your route handlers, making the `req.body` property available. It is commonly used in Express applications to handle data sent in HTTP POST and PUT requests.

### Why Do We Need `body-parser`?
1. **Parsing Incoming Data**: When a client sends data to a server (e.g., form submissions or JSON payloads), it's sent as a stream of raw bytes. `body-parser` processes this raw data into a format that your application can work with, such as JSON or URL-encoded data.
2. **Ease of Access**: Without `body-parser`, you would need to handle the raw request stream manually, which is more complex and prone to errors.
3. **Middleware Features**: It provides different parsers for different content types:
   - `bodyParser.json()` for JSON payloads.
   - `bodyParser.urlencoded()` for URL-encoded data (e.g., form submissions).

### Example Usage of `body-parser`:
```javascript
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Parse application/json
app.use(bodyParser.json());

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
  console.log(req.body); // Parsed body data
  res.send('Data received');
});
```

### Alternatives to `body-parser`:
1. **Built-in `express.json()` and `express.urlencoded()`**:
   - Since Express 4.16.0 and later, `express` comes with built-in body-parsing middleware. This means you don’t need `body-parser` as a separate dependency.
   - Example:
     ```javascript
     const express = require('express');
     const app = express();

     // Built-in parsing middleware
     app.use(express.json()); // For JSON parsing
     app.use(express.urlencoded({ extended: true })); // For URL-encoded data

     app.post('/submit', (req, res) => {
       console.log(req.body); // Parsed body data
       res.send('Data received');
     });
     ```

2. **Custom Parsing Logic**:
   - You can write custom middleware to handle parsing, but this is generally more complex and unnecessary unless you have very specific requirements.

### Conclusion:
- **Modern Applications**: Use `express.json()` and `express.urlencoded()` for most Express apps. They provide the same functionality as `body-parser` but are built-in, reducing the need for an additional package.
- **Legacy Applications**: `body-parser` was widely used before Express integrated these features.

In summary, while `body-parser` was essential in the past, modern Express versions include parsing middleware that makes `body-parser` unnecessary.



# In express is there is any alternative of res.send().
Yes, in Express, there are multiple alternatives to `res.send()` for sending responses to the client, depending on the type of response you want to send:

### 1. **`res.json()`**
- Sends a JSON response. It automatically sets the `Content-Type` header to `application/json`.
- Useful when sending structured data like objects or arrays.

  ```javascript
  app.get('/json', (req, res) => {
    res.json({ message: 'Hello, world!', status: 'success' });
  });
  ```

### 2. **`res.sendFile()`**
- Sends a file as an HTTP response. It’s useful for serving static files like HTML, images, or PDFs.

  ```javascript
  app.get('/file', (req, res) => {
    res.sendFile(__dirname + '/path/to/your/file.html');
  });
  ```

### 3. **`res.render()`**
- Renders a view template and sends the HTML as a response.
- Commonly used with templating engines like EJS, Pug, or Handlebars.

  ```javascript
  app.set('view engine', 'ejs');

  app.get('/page', (req, res) => {
    res.render('template', { title: 'My Page', content: 'Hello!' });
  });
  ```

### 4. **`res.end()`**
- Ends the response process without sending any data.
- Useful for ending the response if data is sent in chunks or if you need to close the connection.

  ```javascript
  app.get('/end', (req, res) => {
    res.write('Part 1 of response');
    res.end(); // Ends the response
  });
  ```

### 5. **`res.status().send()` or `res.status().json()`**
- Sets the HTTP status code before sending the response.
- Can be used to specify status codes with the response.

  ```javascript
  app.get('/error', (req, res) => {
    res.status(404).send('Page not found');
  });

  app.get('/json-error', (req, res) => {
    res.status(500).json({ error: 'Internal Server Error' });
  });
  ```

### 6. **`res.redirect()`**
- Redirects the client to a different URL.
- Useful for redirecting to another route or external URL.

  ```javascript
  app.get('/redirect', (req, res) => {
    res.redirect('/new-location');
  });
  ```

### 7. **`res.download()`**
- Prompts the client to download a file.
- Useful for file downloads like PDFs or images.

  ```javascript
  app.get('/download', (req, res) => {
    res.download(__dirname + '/path/to/your/file.pdf');
  });
  ```

### 8. **`res.type()`**
- Sets the `Content-Type` for the response without sending data.
- Often used in combination with `res.send()` or `res.end()`.

  ```javascript
  app.get('/text', (req, res) => {
    res.type('text/plain');
    res.send('This is plain text');
  });
  ```

### Conclusion
- **Choose `res.send()`** for quick, straightforward responses.
- **Use `res.json()`** for JSON data, which is common for REST APIs.
- **Use `res.render()`** when working with view templates.
- **Choose `res.download()` or `res.sendFile()`** for serving files.
- **Use `res.redirect()`** for URL redirections.

The choice depends on your application's specific needs and the type of response you want to send.


- At the time of login we have to create access token & refresh token, and save only RT in DB
- Explanation
Let's go through the "why" behind each part of the `handleLogin` function to understand the rationale and importance of each step.

### 1. Extracting Cookies and Request Body
```javascript
const cookies = req.cookies;
console.log(`cookie available at login: ${JSON.stringify(cookies)}`);
const { user, pwd } = req.body;
if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
```
**Why?**
- **Cookies**: Extracting cookies is necessary to check for the presence of a refresh token, which might be used for token reuse detection.
- **Request Body**: Extracting `user` and `pwd` from the request body is essential for authenticating the user.
- **Validation**: Checking if `user` and `pwd` are present ensures that the request is valid. Returning a `400 Bad Request` if either is missing helps prevent unnecessary database queries and provides immediate feedback to the client.

### 2. Finding the User in the Database
```javascript
const foundUser = await User.findOne({ username: user }).exec();
if (!foundUser) return res.sendStatus(401); // Unauthorized 
```
**Why?**
- **Database Query**: Searching for the user in the database is necessary to verify that the username exists.
- **Authorization**: Returning `401 Unauthorized` if the user is not found ensures that only valid users can proceed, preventing unauthorized access.

### 3. Password Validation
```javascript
const match = await bcrypt.compare(pwd, foundUser.password);
if (match) {
    const roles = Object.values(foundUser.roles).filter(Boolean);
```
**Why?**
- **Password Comparison**: Using bcrypt to compare the provided password with the stored hashed password ensures that the user’s credentials are valid without exposing the plaintext password.
- **Roles Extraction**: Extracting roles is important for generating the JWT payload with appropriate access control information.

### 4. Creating JWT Tokens
```javascript
const accessToken = jwt.sign(
    {
        "UserInfo": {
            "username": foundUser.username,
            "roles": roles
        }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10s' }
);
const newRefreshToken = jwt.sign(
    { "username": foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
);
```
**Why?**
- **Access Token**: The access token is used for short-term authentication and includes user info and roles. Setting a short expiration time (e.g., 10 seconds in the example) limits the window during which the token can be exploited if compromised.
- **Refresh Token**: The refresh token allows for issuing new access tokens without requiring the user to log in again. A longer expiration time (e.g., 1 day) reduces the frequency of login prompts while maintaining security.

### 5. Refresh Token Handling
```javascript
let newRefreshTokenArray =
    !cookies?.jwt
        ? foundUser.refreshToken
        : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);
```
**Why?**
- **Token Array Update**: This ensures that the new refresh token array either remains the same if no JWT cookie is present or filters out the current JWT cookie, maintaining a clean token list.

### 6. Handling Refresh Token Reuse and Cleanup
```javascript
if (cookies?.jwt) {
    const refreshToken = cookies.jwt;
    const foundToken = await User.findOne({ refreshToken }).exec();

    // Detected refresh token reuse!
    if (!foundToken) {
        console.log('attempted refresh token reuse at login!')
        // clear out ALL previous refresh tokens
        newRefreshTokenArray = [];
    }

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
}
```
**Why?**
- **Reuse Detection**: Checking if the refresh token exists in any user’s token list helps detect potential token reuse, which could indicate token theft or replay attacks.
- **Clearing Cookies**: Clearing the old JWT cookie ensures that compromised tokens are invalidated and cannot be reused.

### 7. Saving New Refresh Token
```javascript
foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
const result = await foundUser.save();
console.log(result);
console.log(roles);
```
**Why?**
- **Token Persistence**: Updating the user’s refresh token list with the new refresh token ensures that the token can be used for subsequent authentication requests.
- **Logging**: Logging the result and roles aids in debugging and provides a record of the operation.

### 8. Sending the Response
```javascript
res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
res.json({ roles, accessToken });
```
**Why?**
- **Secure Cookie**: Setting the refresh token as a secure, HttpOnly cookie helps protect it from being accessed through client-side scripts, reducing the risk of XSS attacks.
- **Response**: Sending the roles and access token to the user allows the client to use the access token for authenticated requests and manage user roles appropriately.

Overall, each step in the `handleLogin` function is designed to enhance security, ensure proper authentication, and handle potential security issues such as token reuse. This approach balances user convenience with robust security practices. If you have any more questions or need further clarification, feel free to ask!

https://github.com/gitdagray/refresh_token_rotation/blob/main/controllers/authController.js