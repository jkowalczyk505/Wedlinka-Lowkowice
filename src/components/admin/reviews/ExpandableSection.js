import { useState } from "react";
import { FiChevronRight, FiChevronDown, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Button from "../../common/Button";

const PER_PAGE = 2;

export default function ExpandableSection({ title, children }) {
  const [open, setOpen]   = useState(false);
  const [page, setPage]   = useState(0);

  const items   = Array.isArray(children) ? children : [children];
  const pages   = Math.ceil(items.length / PER_PAGE);
  const slice   = items.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  // resetujemy numer strony przy ponownym otwarciu
  const toggle = () => {
    setOpen(o => {
      if (!o) setPage(0);
      return !o;
    });
  };

  return (
    <div className="expandable-section">
      <Button
        variant="red"
        className="expand-toggle"
        onClick={toggle}
        type="button"
      >
        {open ? <FiChevronDown /> : <FiChevronRight />}
        &nbsp;{title}
      </Button>

      {open && (
        <div className="expand-content">
          {slice}

          {pages > 1 && (
            <div className="pager">
              <Button
                variant="beige"
                className="pager-btn"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                <FiArrowLeft />
              </Button>

              <span className="pager-info">
                strona {page + 1} / {pages}
              </span>

              <Button
                variant="beige"
                className="pager-btn"
                disabled={page + 1 === pages}
                onClick={() => setPage(p => p + 1)}
              >
                <FiArrowRight />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
