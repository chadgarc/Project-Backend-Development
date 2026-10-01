import routes from "./routes/index.js";
import dotenv from "dotenv";
import mongoose from "./config/connection.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api",routes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});