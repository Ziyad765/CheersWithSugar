import express from "express";
import { createServer as createViteServer } from "vite";
import { MongoClient, ObjectId } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

let client: MongoClient | null = null;
if (MONGODB_URI) {
  client = new MongoClient(MONGODB_URI);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let db: any = null;

  if (client) {
    try {
      await client.connect();
      db = client.db();
      console.log("Connected to MongoDB");
      
      const productsCol = db.collection("products");
      const count = await productsCol.countDocuments();
      if (count === 0) {
        const seedProducts = [
          {
            name: "Classic Chocolate Truffle",
            description: "Rich, dense chocolate cake layered with smooth dark chocolate ganache.",
            price: 599,
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1089&ixlib=rb-4.0.3",
            category: "Cakes",
            isCustomizable: true,
          },
          {
            name: "Red Velvet Dream",
            description: "Soft red velvet sponge with signature cream cheese frosting.",
            price: 649,
            image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&q=80&w=1114&ixlib=rb-4.0.3",
            category: "Cakes",
            isCustomizable: true,
          },
          {
            name: "Fresh Fruit Gateau",
            description: "Light vanilla sponge loaded with seasonal fresh fruits and whipped cream.",
            price: 699,
            image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=1065&ixlib=rb-4.0.3",
            category: "Cakes",
            isCustomizable: true,
          },
          {
            name: "Assorted Macarons Box",
            description: "A box of 12 delicate French macarons in assorted flavors.",
            price: 899,
            image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=1170&ixlib=rb-4.0.3",
            category: "Sweets",
            isCustomizable: false,
          },
          {
            name: "Premium Motichoor Ladoo",
            description: "Traditional Indian sweet made with pure desi ghee and premium dry fruits.",
            price: 450,
            image: "https://images.unsplash.com/photo-1605197148563-3ec162f49492?auto=format&fit=crop&q=80&w=1170&ixlib=rb-4.0.3",
            category: "Sweets",
            isCustomizable: false,
          },
          {
            name: "Custom Photo Cake",
            description: "Your favorite photo printed on a delicious cake of your choice.",
            price: 899,
            image: "https://images.unsplash.com/photo-1557925923-33b251dc3296?auto=format&fit=crop&q=80&w=1170&ixlib=rb-4.0.3",
            category: "Custom",
            isCustomizable: true,
          }
        ];
        await productsCol.insertMany(seedProducts);
        console.log("Seeded initial products");
      }
    } catch (e) {
      console.error("MongoDB connection error:", e);
    }
  } else {
    console.warn("MONGODB_URI is not set. Database features will not work.");
  }

  const mapId = (doc: any) => {
    if (!doc) return doc;
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  };

  // --- API Routes ---

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    try {
      const products = await db.collection("products").find({}).toArray();
      res.json(products.map(mapId));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    try {
      const product = await db.collection("products").findOne({ _id: new ObjectId(req.params.id) });
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(mapId(product));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    try {
      const order = {
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      const result = await db.collection("orders").insertOne(order);
      res.status(201).json({ id: result.insertedId, message: "Order placed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to place order" });
    }
  });

  // Get all orders (Admin)
  app.get("/api/orders", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    try {
      const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray();
      res.json(orders.map(mapId));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Update order status (Admin)
  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { status } = req.body;
    try {
      await db.collection("orders").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status } }
      );
      res.json({ message: "Order status updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
