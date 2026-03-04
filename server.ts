import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "data.db");
const db = new Database(dbPath);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    isCustomizable BOOLEAN DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    customerPhone TEXT NOT NULL,
    customerLocation TEXT NOT NULL,
    deliveryDate TEXT NOT NULL,
    orderType TEXT NOT NULL, -- 'simple' or 'custom'
    productId INTEGER,
    customSize TEXT,
    customMessage TEXT,
    customDetails TEXT,
    totalPrice REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'delivered', 'cancelled'
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(productId) REFERENCES products(id)
  );
`);

// Seed initial products if empty
const stmt = db.prepare("SELECT COUNT(*) as count FROM products");
const { count } = stmt.get() as { count: number };

if (count === 0) {
  const insertProduct = db.prepare(
    "INSERT INTO products (name, description, price, image, category, isCustomizable) VALUES (?, ?, ?, ?, ?, ?)"
  );
  
  const seedProducts = [
    {
      name: "Classic Chocolate Truffle",
      description: "Rich, dense chocolate cake layered with smooth dark chocolate ganache.",
      price: 599,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1089&ixlib=rb-4.0.3",
      category: "Cakes",
      isCustomizable: 1,
    },
    {
      name: "Red Velvet Dream",
      description: "Soft red velvet sponge with signature cream cheese frosting.",
      price: 649,
      image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&q=80&w=1114&ixlib=rb-4.0.3",
      category: "Cakes",
      isCustomizable: 1,
    },
    {
      name: "Fresh Fruit Gateau",
      description: "Light vanilla sponge loaded with seasonal fresh fruits and whipped cream.",
      price: 699,
      image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=1065&ixlib=rb-4.0.3",
      category: "Cakes",
      isCustomizable: 1,
    },
    {
      name: "Assorted Macarons Box",
      description: "A box of 12 delicate French macarons in assorted flavors.",
      price: 899,
      image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=1170&ixlib=rb-4.0.3",
      category: "Sweets",
      isCustomizable: 0,
    },
    {
      name: "Premium Motichoor Ladoo",
      description: "Traditional Indian sweet made with pure desi ghee and premium dry fruits.",
      price: 450,
      image: "https://images.unsplash.com/photo-1605197148563-3ec162f49492?auto=format&fit=crop&q=80&w=1170&ixlib=rb-4.0.3",
      category: "Sweets",
      isCustomizable: 0,
    },
    {
      name: "Custom Photo Cake",
      description: "Your favorite photo printed on a delicious cake of your choice.",
      price: 899,
      image: "https://images.unsplash.com/photo-1557925923-33b251dc3296?auto=format&fit=crop&q=80&w=1170&ixlib=rb-4.0.3",
      category: "Custom",
      isCustomizable: 1,
    }
  ];

  const insertMany = db.transaction((products) => {
    for (const p of products) {
      insertProduct.run(p.name, p.description, p.price, p.image, p.category, p.isCustomizable);
    }
  });
  insertMany(seedProducts);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Get all products
  app.get("/api/products", (req, res) => {
    try {
      const products = db.prepare("SELECT * FROM products").all();
      // Convert isCustomizable to boolean
      const mapped = products.map((p: any) => ({ ...p, isCustomizable: p.isCustomizable === 1 }));
      res.json(mapped);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", (req, res) => {
    try {
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json({ ...product, isCustomizable: product.isCustomizable === 1 });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Create order
  app.post("/api/orders", (req, res) => {
    const {
      customerName,
      customerPhone,
      customerLocation,
      deliveryDate,
      orderType,
      productId,
      customSize,
      customMessage,
      customDetails,
      totalPrice
    } = req.body;

    try {
      const stmt = db.prepare(`
        INSERT INTO orders (
          customerName, customerPhone, customerLocation, deliveryDate,
          orderType, productId, customSize, customMessage, customDetails, totalPrice
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        customerName, customerPhone, customerLocation, deliveryDate,
        orderType, productId || null, customSize || null, customMessage || null, customDetails || null, totalPrice
      );
      
      res.status(201).json({ id: result.lastInsertRowid, message: "Order placed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to place order" });
    }
  });

  // Get all orders (Admin)
  app.get("/api/orders", (req, res) => {
    try {
      const orders = db.prepare(`
        SELECT o.*, p.name as productName 
        FROM orders o 
        LEFT JOIN products p ON o.productId = p.id
        ORDER BY o.createdAt DESC
      `).all();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Update order status (Admin)
  app.patch("/api/orders/:id/status", (req, res) => {
    const { status } = req.body;
    try {
      const stmt = db.prepare("UPDATE orders SET status = ? WHERE id = ?");
      stmt.run(status, req.params.id);
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
