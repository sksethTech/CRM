import { useState } from 'react';

const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onAdd, 
  searchTerm, 
  onSearchChange,
  actions = true 
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm || '');

  const handleSearch = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const filteredData = data?.filter(item => {
    if (!localSearch) return true;
    const searchLower = localSearch.toLowerCase();
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="data-table-container">
      <div className="table-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search..."
            value={localSearch}
            onChange={handleSearch}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        {onAdd && (
          <button className="add-btn" onClick={onAdd}>
            <span className="btn-icon">+</span> Add New
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.title}
                </th>
              ))}
              {actions && <th className="actions-col">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="no-data">
                  No records found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item._id || index}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="actions-cell">
                      {onEdit && (
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => onEdit(item)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => onDelete(item)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .data-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .search-box {
          position: relative;
          width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 10px 40px 10px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: #999;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-icon {
          font-size: 18px;
          font-weight: bold;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          padding: 16px 20px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f8f9fa;
          border-bottom: 2px solid #e0e0e0;
        }

        .data-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          color: #333;
        }

        .data-table tbody tr:hover {
          background: #f8f9fa;
        }

        .actions-col {
          width: 120px;
          text-align: center;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .action-btn {
          padding: 6px 10px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          background: transparent;
        }

        .edit-btn:hover {
          background: #e3f2fd;
          transform: scale(1.1);
        }

        .delete-btn:hover {
          background: #ffebee;
          transform: scale(1.1);
        }

        .no-data {
          text-align: center;
          padding: 40px !important;
          color: #999;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            gap: 16px;
          }

          .search-box {
            width: 100%;
          }

          .add-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DataTable;
