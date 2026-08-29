export default function Footer() {
  return (
    <footer className="site-footer">
      <p>FlipMyCart &copy; {new Date().getFullYear()} — a commission-free marketplace, built as an academic NoSQL/polyglot-persistence project.</p>
      <p className="site-footer-note">Payments in this project are simulated for demonstration purposes only.</p>
    </footer>
  );
}
