import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * Breadcrumbs komponent pokazujący ścieżkę nawigacji.
 * Przykład użycia:
 * <Breadcrumbs
 *   crumbs={[
 *     { label: 'Strona główna', to: '/' },
 *     { label: 'Kiełbasy', to: '/sklep/kielbasy' }
 *   ]}
 * />
 */
export default function Breadcrumbs({ crumbs }) {
  return (
    <nav className="breadcrumbs">
      {crumbs.map((crumb, index) => (
        <span key={index} className="crumb">
          {crumb.to ? (
            <Link to={crumb.to} className="breadcrumb-link">
              {crumb.label}
            </Link>
          ) : (
            <span className="breadcrumb-current">{crumb.label}</span>
          )}
          {index < crumbs.length - 1 && (
            <span className="separator">/</span>
          )}
        </span>
      ))}
    </nav>
  );
}

Breadcrumbs.propTypes = {
  crumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string
    })
  ).isRequired
};
