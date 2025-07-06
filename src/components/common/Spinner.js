function Spinner({ fullscreen = false, size = "default" }) {
  const className = fullscreen
    ? "spinner-overlay"
    : size === "small"
    ? "spinner-small"
    : "spinner-inline";

  return (
    <div className={className}>
      <div className="spinner" />
    </div>
  );
}

export default Spinner;
