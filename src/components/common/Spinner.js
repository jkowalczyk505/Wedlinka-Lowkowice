function Spinner({ fullscreen = false }) {
  return (
    <div className={fullscreen ? "spinner-overlay" : "spinner-inline"}>
      <div className="spinner" />
    </div>
  );
}

export default Spinner;
