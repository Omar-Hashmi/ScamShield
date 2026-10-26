export default function Button({ loading, children, loadingText = 'Please wait…', ...rest }) {
  return (
    <button className="btn-primary" disabled={loading} aria-busy={loading} {...rest}>
      {loading ? (<><span className="spinner" aria-hidden="true" /> {loadingText}</>) : children}
    </button>
  );
}
