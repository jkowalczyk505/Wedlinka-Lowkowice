// src/components/admin/AdminProductCategory.jsx
import PropTypes from "prop-types";
import AdminProductTile from "./AdminProductTile";

export default function AdminProductCategory({ title, products, onEdit, onDelete }) {
  return (
    <section className="products-from-category-container">
      <h2 className="category-title">{title}</h2>

      <div className="admin-products-grid">
        {products.map(p => (
          <AdminProductTile
            key={p.id}
            product={p}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

AdminProductCategory.propTypes = {
  title:    PropTypes.string.isRequired,
  products: PropTypes.array.isRequired,
  onEdit:   PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
