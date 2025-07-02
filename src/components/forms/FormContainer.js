function FormContainer({ title, onSubmit, children }) {
  return (
    <form className="form-wrapper" onSubmit={onSubmit}>
      {title && <h2>{title}</h2>}
      {children}
    </form>
  );
}

export default FormContainer;
