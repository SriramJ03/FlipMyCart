import { useState } from 'react';

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


export default function Analytics() {

  const [activeTab, setActiveTab] = useState('Sales');


  /* =========================================
     SALES DATA
  ========================================= */

  const salesData = [
    {
      month: 'Jun',
      orders: 12,
      revenue: 85000,
    },
    {
      month: 'Jul',
      orders: 18,
      revenue: 62000,
    },
    {
      month: 'Aug',
      orders: 25,
      revenue: 106990,
    },
  ];


  const categorySalesData = [
    {
      name: 'Electronics',
      value: 45,
    },
    {
      name: 'Mobiles',
      value: 25,
    },
    {
      name: 'Clothing',
      value: 15,
    },
    {
      name: 'Home',
      value: 15,
    },
  ];


  /* =========================================
     SELLER DATA
  ========================================= */

  const sellerData = [
    {
      name: 'TechHub',
      sales: 85000,
      products: 12,
    },
    {
      name: 'FashionHub',
      sales: 52000,
      products: 8,
    },
    {
      name: 'HomeStore',
      sales: 35000,
      products: 10,
    },
    {
      name: 'MobileZone',
      sales: 72000,
      products: 15,
    },
  ];


  const sellerDistribution = [
    {
      name: 'Active',
      value: 8,
    },
    {
      name: 'Inactive',
      value: 2,
    },
  ];


  /* =========================================
     PRODUCT DATA
  ========================================= */

  const productData = [
    {
      category: 'Electronics',
      products: 12,
    },
    {
      category: 'Mobiles',
      products: 8,
    },
    {
      category: 'Clothing',
      products: 15,
    },
    {
      category: 'Home',
      products: 10,
    },
  ];


  const stockData = [
    {
      name: 'In Stock',
      value: 45,
    },
    {
      name: 'Low Stock',
      value: 8,
    },
    {
      name: 'Out of Stock',
      value: 5,
    },
  ];


  /* =========================================
     CUSTOMER DATA
  ========================================= */

  const customerData = [
    {
      month: 'Jun',
      customers: 45,
    },
    {
      month: 'Jul',
      customers: 72,
    },
    {
      month: 'Aug',
      customers: 110,
    },
  ];


  const customerDistribution = [
    {
      name: 'New Customers',
      value: 65,
    },
    {
      name: 'Returning Customers',
      value: 35,
    },
  ];


  /* =========================================
     INVENTORY DATA
  ========================================= */

  const inventoryData = [
    {
      category: 'Electronics',
      stock: 120,
    },
    {
      category: 'Mobiles',
      stock: 85,
    },
    {
      category: 'Clothing',
      stock: 200,
    },
    {
      category: 'Home',
      stock: 75,
    },
  ];


  const inventoryStatusData = [
    {
      name: 'Available',
      value: 80,
    },
    {
      name: 'Low Stock',
      value: 15,
    },
    {
      name: 'Out of Stock',
      value: 5,
    },
  ];


  /* =========================================
     COLORS
  ========================================= */

  const COLORS = [
    '#ff6b35',
    '#243b5a',
    '#4caf50',
    '#9c6ade',
    '#ffb020',
  ];


  /* =========================================
     TABS
  ========================================= */

  const tabs = [
    'Sales',
    'Sellers',
    'Products',
    'Customer Behaviour',
    'Inventory',
  ];


  return (

    <div className="analytics-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="analytics-title-section">

        <div>

          <h1>Data analysis</h1>

          <p>
            Monitor your FlipMyCart business performance.
          </p>

        </div>

      </div>



      {/* =====================================
          TABS
      ===================================== */}

      <div className="analytics-tabs">

        {tabs.map((tab) => (

          <button
            key={tab}

            className={
              activeTab === tab
                ? 'analytics-tab active'
                : 'analytics-tab'
            }

            onClick={() => setActiveTab(tab)}
          >

            {tab}

          </button>

        ))}

      </div>



      {/* =====================================
          SALES
      ===================================== */}

      {activeTab === 'Sales' && (

        <div className="analytics-content">


          {/* STAT CARDS */}

          <div className="analytics-stats">


            <div className="analytics-stat-card">

              <div className="stat-icon">
                🛒
              </div>

              <div>

                <p>Total Orders</p>

                <h2>55</h2>

                <span className="growth">
                  +12% growth
                </span>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon orange">
                ₹
              </div>

              <div>

                <p>Total Revenue</p>

                <h2>
                  ₹1,06,990
                </h2>

                <span className="growth">
                  +18% growth
                </span>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon green">
                📦
              </div>

              <div>

                <p>Products Sold</p>

                <h2>97</h2>

                <span className="growth">
                  Across all categories
                </span>

              </div>

            </div>


          </div>



          {/* CHARTS */}

          <div className="analytics-charts">


            {/* REVENUE */}

            <div className="analytics-chart-card large-chart">

              <h2>
                Revenue trend
              </h2>

              <p>
                Monthly revenue performance
              </p>


              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <LineChart
                  data={salesData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />


                  <XAxis
                    dataKey="month"
                  />


                  <YAxis />


                  <Tooltip />


                  <Legend />


                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ff6b35"
                    strokeWidth={3}
                  />

                </LineChart>

              </ResponsiveContainer>


            </div>



            {/* PIE */}

            <div className="analytics-chart-card">

              <h2>
                Category distribution
              </h2>

              <p>
                Product sales by category
              </p>


              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={categorySalesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                  >

                    {categorySalesData.map(
                      (entry, index) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[
                              index % COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>


                  <Tooltip />


                  <Legend />

                </PieChart>

              </ResponsiveContainer>


            </div>


          </div>



          {/* SALES BAR CHART */}

          <div className="analytics-chart-card full-chart">

            <h2>
              Orders overview
            </h2>

            <p>
              Monthly number of orders
            </p>


            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <BarChart
                data={salesData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />


                <XAxis
                  dataKey="month"
                />


                <YAxis />


                <Tooltip />


                <Legend />


                <Bar
                  dataKey="orders"
                  fill="#243b5a"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>


          </div>


        </div>

      )}



      {/* =====================================
          SELLERS
      ===================================== */}

      {activeTab === 'Sellers' && (

        <div className="analytics-content">


          <div className="analytics-stats">


            <div className="analytics-stat-card">

              <div className="stat-icon">
                🏪
              </div>

              <div>

                <p>Total Sellers</p>

                <h2>10</h2>

                <span className="growth">
                  Registered sellers
                </span>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div>

                <p>Active Sellers</p>

                <h2>8</h2>

                <span className="growth">
                  Currently active
                </span>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon orange">
                ₹
              </div>

              <div>

                <p>Seller Revenue</p>

                <h2>₹2.44L</h2>

                <span className="growth">
                  Total generated
                </span>

              </div>

            </div>


          </div>



          <div className="analytics-charts">


            <div className="analytics-chart-card large-chart">

              <h2>
                Seller performance
              </h2>

              <p>
                Revenue generated by sellers
              </p>


              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={sellerData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="name"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="sales"
                    fill="#ff6b35"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>


            </div>



            <div className="analytics-chart-card">

              <h2>
                Seller status
              </h2>

              <p>
                Active vs inactive sellers
              </p>


              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={sellerDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                  >

                    {sellerDistribution.map(
                      (entry, index) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[index]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>


            </div>


          </div>



          <div className="analytics-table-card">

            <h2>
              Seller overview
            </h2>


            <table>

              <thead>

                <tr>

                  <th>
                    Seller
                  </th>

                  <th>
                    Products
                  </th>

                  <th>
                    Revenue
                  </th>

                </tr>

              </thead>


              <tbody>

                {sellerData.map(
                  (seller) => (

                    <tr
                      key={seller.name}
                    >

                      <td>
                        {seller.name}
                      </td>

                      <td>
                        {seller.products}
                      </td>

                      <td>
                        ₹{seller.sales.toLocaleString('en-IN')}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>


          </div>


        </div>

      )}



      {/* =====================================
          PRODUCTS
      ===================================== */}

      {activeTab === 'Products' && (

        <div className="analytics-content">


          <div className="analytics-stats">


            <div className="analytics-stat-card">

              <div className="stat-icon">
                📦
              </div>

              <div>

                <p>Total Products</p>

                <h2>45</h2>

                <span>
                  Across categories
                </span>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div>

                <p>In Stock</p>

                <h2>32</h2>

                <span className="growth">
                  Available products
                </span>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon orange">
                !
              </div>

              <div>

                <p>Low / Out of Stock</p>

                <h2>13</h2>

                <span className="warning-text">
                  Needs attention
                </span>

              </div>

            </div>


          </div>



          <div className="analytics-charts">


            <div className="analytics-chart-card large-chart">

              <h2>
                Products by category
              </h2>

              <p>
                Number of products in each category
              </p>


              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={productData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="category"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="products"
                    fill="#243b5a"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>


            </div>



            <div className="analytics-chart-card">

              <h2>
                Stock distribution
              </h2>

              <p>
                Current product stock status
              </p>


              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={stockData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                  >

                    {stockData.map(
                      (entry, index) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[index]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>


            </div>


          </div>


        </div>

      )}



      {/* =====================================
          CUSTOMER BEHAVIOUR
      ===================================== */}

      {activeTab === 'Customer Behaviour' && (

        <div className="analytics-content">


          <div className="analytics-stats">


            <div className="analytics-stat-card">

              <div className="stat-icon">
                👥
              </div>

              <div>

                <p>Total Customers</p>

                <h2>110</h2>

                <span className="growth">
                  +15% growth
                </span>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon green">
                🔁
              </div>

              <div>

                <p>Returning Customers</p>

                <h2>35%</h2>

                <span>
                  Repeat buyers
                </span>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon orange">
                🛒
              </div>

              <div>

                <p>Average Orders</p>

                <h2>2.5</h2>

                <span>
                  Per customer
                </span>

              </div>

            </div>


          </div>



          <div className="analytics-charts">


            <div className="analytics-chart-card large-chart">

              <h2>
                Customer growth
              </h2>

              <p>
                Monthly customer registrations
              </p>


              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <LineChart
                  data={customerData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="#4caf50"
                    strokeWidth={3}
                  />

                </LineChart>

              </ResponsiveContainer>


            </div>



            <div className="analytics-chart-card">

              <h2>
                Customer type
              </h2>

              <p>
                New vs returning customers
              </p>


              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={customerDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                  >

                    {customerDistribution.map(
                      (entry, index) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[index]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>


            </div>


          </div>


        </div>

      )}



      {/* =====================================
          INVENTORY
      ===================================== */}

      {activeTab === 'Inventory' && (

        <div className="analytics-content">


          <div className="analytics-stats">


            <div className="analytics-stat-card">

              <div className="stat-icon">
                📦
              </div>

              <div>

                <p>Total Inventory</p>

                <h2>480</h2>

                <span>
                  Total units
                </span>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon orange">
                ⚠
              </div>

              <div>

                <p>Low Stock</p>

                <h2>15</h2>

                <span className="warning-text">
                  Requires restocking
                </span>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon">
                ✕
              </div>

              <div>

                <p>Out of Stock</p>

                <h2>5</h2>

                <span className="danger-text">
                  Currently unavailable
                </span>

              </div>

            </div>


          </div>



          <div className="analytics-charts">


            <div className="analytics-chart-card large-chart">

              <h2>
                Inventory by category
              </h2>

              <p>
                Current available stock
              </p>


              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={inventoryData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="category"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="stock"
                    fill="#4caf50"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>


            </div>



            <div className="analytics-chart-card">

              <h2>
                Inventory status
              </h2>

              <p>
                Overall stock availability
              </p>


              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={inventoryStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                  >

                    {inventoryStatusData.map(
                      (entry, index) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[index]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>


            </div>


          </div>


        </div>

      )}


    </div>

  );

}