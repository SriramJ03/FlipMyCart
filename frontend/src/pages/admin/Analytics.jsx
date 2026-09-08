import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  getSalesAnalysisApi,
  getSellerPerformanceApi,
  getProductAnalysisApi,
  getCustomerBehaviourApi,
  getInventoryAnalysisApi,
} from '../../api/analytics';
import Loader from '../../components/Loader';
const categoryNames = {
  eletronicos: "Electronics",
  construcao_ferramentas_construcao: "Construction & Tools",
  beleza_saude: "Beauty & Health",
  cama_mesa_banho: "Bed, Bath & Table",
  informatica_acessorios: "Computers & Accessories",
  cool_stuff: "Cool Stuff",
  telefonia: "Telephony",
  perfumaria: "Perfume & Cosmetics",
  brinquedos: "Toys",
  moveis_decoracao: "Furniture & Decor",
  utilidades_domesticas: "Household Utilities",
  esporte_lazer: "Sports & Leisure",
  relogios_presentes: "Watches & Gifts",
  livros: "Books",
  papelaria: "Stationery",
  ferramentas_jardim: "Garden Tools",
  pet_shop: "Pet Shop",
  automotivo: "Automotive",
  bebes: "Baby",
  instrumentos_musicais: "Musical Instruments",
  malas_acessorios: "Luggage & Accessories",
  alimentos: "Food",
  bebidas: "Beverages",
  agro_industria_e_comercio: "Agriculture, Industry & Commerce",
  eletrodomesticos: "Home Appliances",
  eletrodomesticos_2: "Home Appliances",
  fashion_bolsas_e_acessorios: "Fashion Bags & Accessories",
  fashion_calcados: "Fashion Shoes",
  fashion_roupa_masculina: "Men's Fashion",
  fashion_roupa_feminina: "Women's Fashion",
  fashion_esporte: "Sports Fashion",
  fashion_underwear_e_moda_praia: "Underwear & Beachwear",
  casa_conforto: "Home Comfort",
  casa_construcao: "Home Construction",
  casa_utilidades: "Home Utilities",
  industria_comercio_e_negocios: "Industry, Commerce & Business",
  telefonia_fixa: "Fixed Telephony",
  artigos_de_festa: "Party Supplies",
  artigos_de_natal: "Christmas Items",
  audio: "Audio",
  dvds_blu_ray: "DVDs & Blu-ray",
  musica: "Music",
  cine_foto: "Photography & Film",
  consoles_games: "Consoles & Games",
  pc_gamer: "Gaming PC",
  pcs: "Computers",
  tablets_impressao_imagem: "Tablets & Printing",
  portateis_casa_forno_e_cafe: "Portable Home Appliances",
  sinalizacao_e_seguranca: "Signs & Security",
  artigos_de_madeira: "Wood Products",
  artes: "Arts",
  artes_e_artesanato: "Arts & Crafts",
  flores: "Flowers",
  fraldas_higiene: "Diapers & Hygiene",
  livros_importados: "Imported Books",
  livros_tecnicos: "Technical Books",
  livros_interesse_geral: "General Interest Books",
  seguros_e_servicos: "Insurance & Services",
  cds_dvds_musicais: "Music CDs & DVDs",
  fashion_masculina: "Men's Fashion",
};

const COLORS = ['#ff6b35', '#243b5a', '#4caf50', '#9c6ade', '#ffb020'];
const brl = (value) => `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('Sales');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getSalesAnalysisApi(),
      getSellerPerformanceApi(),
      getProductAnalysisApi(),
      getCustomerBehaviourApi(),
      getInventoryAnalysisApi(),
    ])
      .then(([sales, sellers, products, customers, inventory]) => {
        setData({ sales: sales.data, sellers: sellers.data, products: products.data, customers: customers.data, inventory: inventory.data });
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Unable to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const inventoryStatus = useMemo(() => {
    if (!data) return [];
    const a = data.inventory.availability;
    return [
      { name: 'Available units', value: Number(a.available_units || 0) },
      { name: 'Low-stock products', value: data.inventory.lowStock.length },
      { name: 'Out of stock', value: Number(a.out_of_stock || 0) },
    ];
  }, [data]);

  if (loading) return <Loader />;
  if (error) return <div className="dashboard-page"><h1>Data analysis</h1><div className="alert alert-danger">{error}</div></div>;

  const { sales, sellers, products, customers, inventory } = data;
  const sellerData = sellers.rows.map((s) => ({ name: s.sellerId.slice(0, 8), revenue: Number(s.totalRevenue || 0), units: s.unitsSold })); 
 const productData = products.mostPurchased.map((p) => ({ name: p.productId.slice(0, 8), units: p.timesPurchased, revenue: Number(p.revenue || 0) }));
 const viewedProductData = (products.mostViewed || []).map((p) => ({
  name: p.name,
  views: Number(p.views || 0),
  uniqueUsers: Number(p.uniqueUsers || 0)
}));

const searchData = (customers.activity?.mostSearched || []).map((item) => ({
  name: item.query,
  searches: Number(item.searches || 0)
}));

const viewedCategoryData = (
  customers.activity?.mostViewedCategories || []
).map((item) => ({
  name: item.name,
  views: Number(item.views || 0)
}));

const activityData = (
  customers.activity?.activityByType || []
).map((item) => ({
  name: item.activityType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()),
  count: Number(item.count || 0)
}));
const categoryData = customers.topCategories.map((c) => ({
  name: categoryNames[c.category] || c.category,
  purchases: c.purchases
}));
const salesCategoryData = sales.categorySales.slice(0, 8).map((c) => ({
  ...c,
  category: categoryNames[c.category] || c.category,
}));
  const paymentData = customers.paymentMethods.map((p) => ({ name: p.method, value: p.transactions }));
  const stockData = [
    { name: 'Available', value: Number(inventory.inventory?.available_units || inventory.availability.available_units || 0) },
    { name: 'Low stock', value: inventory.lowStock.length },
    { name: 'Out of stock', value: Number(inventory.availability.out_of_stock || 0) },
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-title-section">
        <div>
          <h1>Data analysis</h1>
        </div>
      </div>

      <div className="analytics-tabs">
        {['Sales', 'Sellers', 'Products', 'Customer Behaviour', 'Inventory'].map((tab) => (
          <button key={tab} className={activeTab === tab ? 'analytics-tab active' : 'analytics-tab'} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Sales' && (
        <div className="analytics-content">
          <div className="analytics-stats">
            <div className="analytics-stat-card"><div className="stat-icon">🛒</div><div><p>Total Orders</p><h2>{sales.totalOrders.toLocaleString()}</h2><span> orders excluding cancelled/unavailable</span></div></div>
            <div className="analytics-stat-card"><div className="stat-icon orange">R$</div><div><p>Total Revenue</p><h2>{brl(sales.totalRevenue)}</h2><span>Item sales value</span></div></div>
            <div className="analytics-stat-card"><div className="stat-icon green">📦</div><div><p>Products Sold</p><h2>{sales.productsSold.toLocaleString()}</h2><span>Order-item records</span></div></div>
          </div>
          <div className="analytics-charts">
            <div className="analytics-chart-card large-chart"><h2>Revenue trend</h2><p>Monthly revenue from the real Olist dataset</p><ResponsiveContainer width="100%" height={320}><LineChart data={sales.monthlyTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v) => brl(v)} /><Legend /><Line type="monotone" dataKey="revenue" stroke="#ff6b35" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
            <div className="analytics-chart-card"><h2>Category sales</h2><p>Revenue by product category</p><ResponsiveContainer width="100%" height={320}><PieChart><Pie data={salesCategoryData} dataKey="revenue" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>{sales.categorySales.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v) => brl(v)} /><Legend /></PieChart></ResponsiveContainer></div>
          </div>
          <div className="analytics-chart-card full-chart"><h2>Monthly orders</h2><ResponsiveContainer width="100%" height={320}><BarChart data={sales.monthlyTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="orderCount" name="Orders" fill="#243b5a" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      )}

      {activeTab === 'Sellers' && (
        <div className="analytics-content">
          <div className="analytics-stats">
            <div className="analytics-stat-card"><div className="stat-icon">🏪</div><div><p>Total Sellers</p><h2>{sellers.totalSellers.toLocaleString()}</h2><span> seller records</span></div></div>
            <div className="analytics-stat-card"><div className="stat-icon green">📦</div><div><p>Top Seller Units</p><h2>{sellerData[0]?.units || 0}</h2><span>Units sold by top seller</span></div></div>
            <div className="analytics-stat-card"><div className="stat-icon orange">R$</div><div><p>Top Seller Revenue</p><h2>{brl(sellerData[0]?.revenue)}</h2><span>Highest seller contribution</span></div></div>
          </div>
          <div className="analytics-chart-card large-chart"><h2>Seller performance</h2><p>Top sellers ranked by item revenue</p><ResponsiveContainer width="100%" height={360}><BarChart data={sellerData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v, n) => n === 'revenue' ? brl(v) : v} /><Legend /><Bar dataKey="revenue" name="Revenue" fill="#ff6b35" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
          <div className="analytics-table-card"><h2>Seller overview</h2><table><thead><tr><th>Seller ID</th><th>City</th><th>State</th><th>Orders</th><th>Units</th><th>Revenue</th></tr></thead><tbody>{sellers.rows.map((s) => <tr key={s.sellerId}><td>{s.sellerId}</td><td>{s.city || '-'}</td><td>{s.state || '-'}</td><td>{s.orderCount}</td><td>{s.unitsSold}</td><td>{brl(s.totalRevenue)}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {activeTab === 'Products' && (
        <div className="analytics-content">
          <div className="analytics-stats">
            <div className="analytics-stat-card"><div className="stat-icon">📦</div><div><p>Total Products</p><h2>{products.totalProducts.toLocaleString()}</h2><span>Olist product catalog</span></div></div>
            <div className="analytics-stat-card"><div className="stat-icon green">★</div><div><p>Highest Rating</p><h2>{products.highestRated[0]?.avgRating || '-'}</h2><span>Single-item reviewed orders</span></div></div>
            <div className="analytics-stat-card"><div className="stat-icon orange">!</div><div><p>Lowest Rating</p><h2>{products.lowestRated[0]?.avgRating || '-'}</h2><span>Product with lowest observed rating</span></div></div>
          </div>
          <div className="analytics-chart-card large-chart"><h2>Most purchased products</h2><p>Product IDs are shown because the Olist product file does not contain product names.</p><ResponsiveContainer width="100%" height={360}><BarChart data={productData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="units" name="Units purchased" fill="#243b5a" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
          <div className="analytics-chart-card large-chart">
  <h2>Most viewed products</h2>

  <p>
    Product views recorded from FlipMyCart MongoDB UserActivity.
  </p>

  <ResponsiveContainer width="100%" height={360}>
    <BarChart
      data={viewedProductData}
      layout="vertical"
    >
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis type="number" />

      <YAxis
        type="category"
        dataKey="name"
        width={180}
      />

      <Tooltip />

      <Legend />

      <Bar
        dataKey="views"
        name="Views"
        fill="#ff6b35"
        radius={[0, 8, 8, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>
          <div className="analytics-table-card"><h2>Highest-rated products</h2><table><thead><tr><th>Product ID</th><th>Category</th><th>Average rating</th><th>Reviews</th></tr></thead><tbody>{products.highestRated.map((p) => <tr key={p.productId}><td>{p.productId}</td><td>{categoryNames[p.category] || p.category || '-'}</td><td>{p.avgRating} / 5</td><td>{p.reviewCount}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {activeTab === 'Customer Behaviour' && (
        <div className="analytics-content">
          <div className="analytics-stats">
            <div className="analytics-stat-card"><div className="stat-icon">👥</div><div><p>Total Customers</p><h2>{customers.totalCustomers.toLocaleString()}</h2><span>Unique customer IDs</span></div></div>
            <div className="analytics-stat-card"><div className="stat-icon green">🔁</div><div><p>Returning Customers</p><h2>{customers.returningCustomers.toLocaleString()}</h2><span>{customers.returningCustomerRate}% of customers</span></div></div>
            <div className="analytics-stat-card"><div className="stat-icon orange">🛒</div><div><p>Average Orders</p><h2>{customers.averageOrdersPerCustomer}</h2><span>Orders per customer</span></div></div>
          </div>
          <div className="analytics-charts">
            <div className="analytics-chart-card large-chart"><h2>Preferred categories</h2><p>Customer purchase behaviour by category</p><ResponsiveContainer width="100%" height={340}><BarChart data={categoryData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={130} /><Tooltip /><Legend /><Bar dataKey="purchases" name="Purchases" fill="#4caf50" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></div>
            <div className="analytics-chart-card"><h2>Payment methods</h2><p>Transaction count by payment type</p><ResponsiveContainer width="100%" height={340}><PieChart><Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>{paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
                   </div>

          {/* Search and category behaviour */}
          <div className="analytics-charts">

            <div className="analytics-chart-card large-chart">
              <h2>Most searched products</h2>
              <p>
                Search queries recorded from FlipMyCart users.
              </p>

              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={searchData}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="searches"
                    name="Searches"
                    fill="#243b5a"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="analytics-chart-card">
              <h2>Most viewed categories</h2>
              <p>
                Category interactions recorded from FlipMyCart users.
              </p>

              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={viewedCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="views"
                    name="Views"
                    fill="#4caf50"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Overall interaction patterns */}
          <div className="analytics-chart-card full-chart">

            <h2>User interaction patterns</h2>

            <p>
              Activity recorded by the FlipMyCart MongoDB UserActivity collection.
            </p>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="count"
                  name="Interactions"
                  fill="#9c6ade"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>
      )}

      {activeTab === 'Inventory' && (
        <div className="analytics-content">
          <div className="analytics-stats">
            <div className="analytics-stat-card"><div className="stat-icon">📦</div><div><p>Total Products</p><h2>{inventory.availability.total_products}</h2><span>Current FlipMyCart catalog</span></div></div>
            <div className="analytics-stat-card"><div className="stat-icon orange">⚠</div><div><p>Low Stock</p><h2>{inventory.lowStock.length}</h2><span>Threshold: 10 units</span></div></div>
            <div className="analytics-stat-card"><div className="stat-icon">✕</div><div><p>Out of Stock</p><h2>{inventory.availability.out_of_stock}</h2><span>Active products unavailable</span></div></div>
          </div>
          <div className="analytics-charts">
            <div className="analytics-chart-card large-chart"><h2>Inventory status</h2><p>Current stock from FlipMyCart MySQL</p><ResponsiveContainer width="100%" height={340}><PieChart><Pie data={stockData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>{stockData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
            <div className="analytics-chart-card"><h2>Low-stock products</h2><table className="data-table"><thead><tr><th>Product</th><th>Stock</th></tr></thead><tbody>{inventory.lowStock.map((p) => <tr key={p.product_id}><td>{p.name}</td><td>{p.stock_quantity}</td></tr>)}</tbody></table></div>
          </div>
        </div>
      )}
    </div>
  );
}
