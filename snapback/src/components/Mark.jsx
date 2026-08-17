// The only navigation in the app: a small plus in the corner.
export default function Mark({ onClick }) {
  return (
    <button className="mark" onClick={onClick} aria-label="Snap">
      <span />
    </button>
  );
}
