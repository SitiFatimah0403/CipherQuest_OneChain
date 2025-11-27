import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import trophyRoutes from "./trophy/trophyRoutes.js";
import leaderboardRoutes from "./leaderboard/leaderboardRoutes.js";
import oneplayRoutes from "./oneplay/oneplayRoutes.js";




const app = express();
app.use(cors());
app.use(express.json());


console.log("Loaded PRIVATE_KEY:", process.env.ONECHAIN_PRIVATE_KEY);

app.get("/", (req, res) => {
  res.send("BACKEND RUN SUCCESSFULLY COKK!");
});

//login 
app.post("/api/login", (req, res) => {
  const { wallet, oneIdToken } = req.body;
  console.log("User login:", wallet, oneIdToken);
  res.json({ success: true, message: "Login received!" });
});

//level completion 
app.post("/api/complete-level", (req, res) => {
  const { wallet, level, score } = req.body;
  console.log(`Player ${wallet} finished Level ${level} with ${score} points`);
  res.json({ success: true, message: "Progress saved!" });
});

// Trophy minting endpoint
app.use("/api/trophy", trophyRoutes);

// Leaderboard endpoint
app.use("/api/leaderboard", leaderboardRoutes);

// OneID callback handler (closes popup & sends token back)
app.get("/oneid-callback", (req, res) => {
  res.send(`
    <html>
      <body>
        <script>
          // Pass the entire URL (with access_token) back to the opener
          window.opener.postMessage(
            { oneid_redirect: window.location.hash },
            "*"
          );
          window.close();
        </script>
        <p>You may close this window.</p>
      </body>
    </html>
  `);
});

//for onePlay badges
app.use("/api/oneplay", oneplayRoutes);


app.listen(5000, () => console.log("🚀 Backend running on http://localhost:5000"));
