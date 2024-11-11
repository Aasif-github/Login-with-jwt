import app from "./app.js";
import { dbConnection } from "./db/db_connection.js";

const PORT = 3002;

dbConnection().then(() => {
    console.log(`Database connected...`);
}).then(() => {
    app.listen(PORT, () => {
        console.log(`server is listen..http://localhost:${PORT}`);
    })
})
