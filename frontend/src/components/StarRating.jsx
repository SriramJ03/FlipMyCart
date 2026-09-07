export default function StarRating({ value = 0, size = 16 }) {
  const rounded = Math.round(value);
  return (
    <span className="star-rating" style={{ fontSize: size }} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? 'star filled' : 'star'}>
          ★
        </span>
      ))}
    </span>
  );
}
