export default function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="alert alert-error">{message}</div>;
}

export function extractErrorMessage(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}
