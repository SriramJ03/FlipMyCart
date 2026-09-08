import { useEffect, useState } from 'react';
import { getSalesAnalysisApi } from '../../api/analytics';
import { getSellerDashboardApi } from '../../api/sellers';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
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

const brl = (value) => `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
import Loader from '../../components/Loader';

export default function SalesAnalytics() {
  const { user } = useAuth();
  const [myPerformance, setMyPerformance] = useState(null);
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSellerDashboardApi(), getSalesAnalysisApi()])
      .then(([dashboardRes, salesRes]) => {
        setMyPerformance(dashboardRes.data?.orders || null);
        setSales(salesRes.data);
      })
      .finally(() => setLoading(false));
  }, [user.sellerId]);

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>Sales analytics</h1>

      {myPerformance && (
        <div className="stat-row">
          <div className="stat-card"><span>{myPerformance.order_count}</span><label>My orders</label></div>
          <div className="stat-card"><span>{myPerformance.units_sold}</span><label>My units sold</label></div>
          <div className="stat-card"><span>{formatCurrency(myPerformance.total_revenue)}</span><label>My revenue</label></div>
        </div>
      )}

      <div className="dashboard-panel">
        <h2>Platform best-selling products (Olist dataset)</h2>
        <table className="data-table">
          <thead><tr><th>Product</th><th>Units sold</th><th>Revenue</th></tr></thead>
          <tbody>
            {sales.bestSellingProducts.map((p) => (
              <tr key={p.productId}><td>{p.productId}</td><td>{p.unitsSold}</td><td>{brl(p.revenue)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-panel">
        <h2>Category-wise sales (Olist dataset)</h2>
        <table className="data-table">
          <thead><tr><th>Category</th><th>Units sold</th><th>Revenue</th></tr></thead>
          <tbody>
            {sales.categorySales.map((c) => (
              <tr key={c.category}><td>{categoryNames[c.category] || c.category}</td><td>{c.unitsSold}</td><td>{brl(c.revenue)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
