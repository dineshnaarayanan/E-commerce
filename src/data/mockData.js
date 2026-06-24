export const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    title: "Apex Sounder Wireless Headphones",
    category: "Electronics",
    price: 199.99,
    comparePrice: 249.99,
    stock: 45,
    status: "Active",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    description: "Premium active noise-cancelling headphones featuring 40 hours of battery life, spatial audio support, and ergonomic memory foam cups for long listening sessions."
  },
  {
    id: "p2",
    title: "Chrono Minimalist Leather Watch",
    category: "Accessories",
    price: 149.00,
    comparePrice: 189.00,
    stock: 12,
    status: "Active",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
    description: "Elegant quartz movement wrist watch fitted with a genuine Italian brown leather strap, water-resistant casing, and minimalist surgical-grade steel dial."
  },
  {
    id: "p3",
    title: "Nomad Waterproof Trail Backpack",
    category: "Travel & Outdoors",
    price: 89.50,
    comparePrice: 110.00,
    stock: 3,
    status: "Active",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
    description: "Highly durable, military-grade ballistic nylon backpack featuring waterproof roll-top closures, laptop security sleeve, and custom ergonomic lumbar support frame."
  },
  {
    id: "p4",
    title: "KeyPro Mechanical RGB Keyboard",
    category: "Electronics",
    price: 129.99,
    comparePrice: 149.99,
    stock: 22,
    status: "Active",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80",
    description: "Hot-swappable tactile linear switches with double-shot PBT keycaps, fully customizable per-key RGB backlighting, and a multi-device wireless connection toggle."
  },
  {
    id: "p5",
    title: "ErgoFlow Mesh Office Chair",
    category: "Furniture",
    price: 249.99,
    comparePrice: 299.99,
    stock: 15,
    status: "Draft",
    image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=80",
    description: "Fully adjustable ergonomic desk chair featuring breathable elastic mesh, adjustable 3D armrests, dynamic lumbar support, and heavy-duty nylon wheels."
  },
  {
    id: "p6",
    title: "Vitals Pro Smart Health Watch",
    category: "Electronics",
    price: 179.99,
    comparePrice: 199.99,
    stock: 0,
    status: "Active",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80",
    description: "Comprehensive health and fitness wearable monitor with real-time heart rate sensor, blood oxygen tracker, sleep analysis, built-in GPS, and 10-day battery life."
  },
  {
    id: "p7",
    title: "Apex Sprint Lightweight Running Shoes",
    category: "Footwear",
    price: 110.00,
    comparePrice: 135.00,
    stock: 35,
    status: "Active",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
    description: "Advanced performance running trainers utilizing a responsive carbon fiber plate, high-traction rubber outer treads, and breathable seamless flyknit uppers."
  },
  {
    id: "p8",
    title: "Organic Lavender Scented Candle",
    category: "Home Decor",
    price: 24.99,
    comparePrice: 29.99,
    stock: 80,
    status: "Active",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&auto=format&fit=crop&q=80",
    description: "Relaxing aromatherapy candle hand-poured with natural organic soy wax, pure lavender essential oil extract, and a wooden wick that crackles softly when lit."
  }
];

export const DEFAULT_CUSTOMERS = [
  {
    id: "c1",
    name: "Eleanor Vance",
    email: "eleanor.vance@example.com",
    phone: "+1 (555) 019-2834",
    location: "Portland, OR, USA",
    orderCount: 3,
    totalSpent: 474.96
  },
  {
    id: "c2",
    name: "Marcus Aurelius",
    email: "marcus.aurelius@example.com",
    phone: "+1 (555) 124-7762",
    location: "New York, NY, USA",
    orderCount: 2,
    totalSpent: 328.99
  },
  {
    id: "c3",
    name: "Sophia Lin",
    email: "sophia.lin@example.com",
    phone: "+1 (555) 892-1209",
    location: "San Francisco, CA, USA",
    orderCount: 1,
    totalSpent: 110.00
  },
  {
    id: "c4",
    name: "David Koomson",
    email: "david.koomson@example.com",
    phone: "+1 (555) 431-9028",
    location: "Houston, TX, USA",
    orderCount: 1,
    totalSpent: 129.99
  },
  {
    id: "c5",
    name: "Isabella Rossi",
    email: "isabella.rossi@example.com",
    phone: "+1 (555) 302-8817",
    location: "Miami, FL, USA",
    orderCount: 1,
    totalSpent: 89.50
  }
];

export const DEFAULT_ORDERS = [
  {
    id: "1001",
    customerId: "c2",
    date: "2026-06-17T11:42:00Z",
    status: "Delivered",
    paymentMethod: "Credit Card (Ending 4211)",
    shipping: 10.00,
    tax: 12.00,
    subtotal: 149.00,
    total: 171.00,
    items: [
      { productId: "p2", title: "Chrono Minimalist Leather Watch", price: 149.00, quantity: 1, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "DHL",
      trackingId: "DHL-827361-NY",
      status: "Delivered",
      timeline: [
        { status: "Processing", date: "2026-06-17T12:00:00Z", desc: "Order details verified & approved by merchant.", completed: true },
        { status: "Shipped", date: "2026-06-17T16:30:00Z", desc: "Consignment dispatched from warehouse terminal.", completed: true },
        { status: "In Transit", date: "2026-06-18T09:15:00Z", desc: "Arrived at courier sorting facility in NY.", completed: true },
        { status: "Out for Delivery", date: "2026-06-19T08:00:00Z", desc: "Dispatched with local delivery runner.", completed: true },
        { status: "Delivered", date: "2026-06-19T14:22:00Z", desc: "Parcel delivered and signed for by client.", completed: true }
      ]
    }
  },
  {
    id: "1002",
    customerId: "c1",
    date: "2026-06-20T08:12:00Z",
    status: "Pending",
    paymentMethod: "PayPal (eleanor@example.com)",
    shipping: 0.00,
    tax: 18.00,
    subtotal: 224.98,
    total: 242.98,
    items: [
      { productId: "p1", title: "Apex Sounder Wireless Headphones", price: 199.99, quantity: 1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80" },
      { productId: "p8", title: "Organic Lavender Scented Candle", price: 24.99, quantity: 1, image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "FedEx",
      trackingId: "FX-83749-US",
      status: "Processing",
      timeline: [
        { status: "Processing", date: "2026-06-20T08:30:00Z", desc: "Order details verified & approved by merchant.", completed: true }
      ]
    }
  },
  {
    id: "1003",
    customerId: "c3",
    date: "2026-06-21T14:30:00Z",
    status: "Shipped",
    paymentMethod: "Apple Pay",
    shipping: 5.00,
    tax: 8.80,
    subtotal: 110.00,
    total: 123.80,
    items: [
      { productId: "p7", title: "Apex Sprint Lightweight Running Shoes", price: 110.00, quantity: 1, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "UPS",
      trackingId: "UPS-928174-CA",
      status: "In Transit",
      timeline: [
        { status: "Processing", date: "2026-06-21T15:00:00Z", desc: "Order details verified & approved by merchant.", completed: true },
        { status: "Shipped", date: "2026-06-21T18:45:00Z", desc: "Consignment dispatched from warehouse terminal.", completed: true },
        { status: "In Transit", date: "2026-06-22T10:11:00Z", desc: "Consignment arrived at international airport terminal.", completed: true }
      ]
    }
  },
  {
    id: "1004",
    customerId: "c4",
    date: "2026-06-22T09:15:00Z",
    status: "Delivered",
    paymentMethod: "Credit Card (Ending 1098)",
    shipping: 8.00,
    tax: 10.40,
    subtotal: 129.99,
    total: 148.39,
    items: [
      { productId: "p4", title: "KeyPro Mechanical RGB Keyboard", price: 129.99, quantity: 1, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "USPS",
      trackingId: "US-716492-TX",
      status: "Delivered",
      timeline: [
        { status: "Processing", date: "2026-06-22T09:30:00Z", desc: "Order details verified & approved by merchant.", completed: true },
        { status: "Shipped", date: "2026-06-22T13:00:00Z", desc: "Consignment dispatched from warehouse terminal.", completed: true },
        { status: "In Transit", date: "2026-06-22T21:40:00Z", desc: "Processed through regional logistics center.", completed: true },
        { status: "Out for Delivery", date: "2026-06-23T07:15:00Z", desc: "Dispatched with local delivery runner.", completed: true },
        { status: "Delivered", date: "2026-06-23T11:05:00Z", desc: "Parcel delivered and signed for by client.", completed: true }
      ]
    }
  },
  {
    id: "1005",
    customerId: "c5",
    date: "2026-06-23T07:10:00Z",
    status: "Cancelled",
    paymentMethod: "Credit Card (Ending 8847)",
    shipping: 5.00,
    tax: 7.16,
    subtotal: 89.50,
    total: 101.66,
    items: [
      { productId: "p3", title: "Nomad Waterproof Trail Backpack", price: 89.50, quantity: 1, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "Unassigned",
      trackingId: "N/A",
      status: "Processing",
      timeline: [
        { status: "Processing", date: "2026-06-23T07:15:00Z", desc: "Order cancelled by client before logistics shipment.", completed: false }
      ]
    }
  },
  {
    id: "1006",
    customerId: "c2",
    date: "2026-06-23T12:05:00Z",
    status: "Pending",
    paymentMethod: "Credit Card (Ending 4211)",
    shipping: 10.00,
    tax: 14.40,
    subtotal: 179.99,
    total: 204.39,
    items: [
      { productId: "p6", title: "Vitals Pro Smart Health Watch", price: 179.99, quantity: 1, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80" }
    ],
    courier: {
      partner: "DHL",
      trackingId: "DHL-1006-US",
      status: "Processing",
      timeline: [
        { status: "Processing", date: "2026-06-23T12:15:00Z", desc: "Order details verified & approved by merchant.", completed: true }
      ]
    }
  }
];

export const DEFAULT_ADMIN = {
  username: "dinesh",
  password: "dinesh@2005",
  name: "Dinesh"
};
