import { useState } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
    full: 'modal-full',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${sizeClasses[size]}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn 0.3s ease;
        }

        .modal-small {
          width: 400px;
        }

        .modal-medium {
          width: 600px;
        }

        .modal-large {
          width: 800px;
        }

        .modal-full {
          width: 95%;
          max-width: 1200px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          color: #1a1a2e;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          color: #666;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: #f5f7fa;
          color: #333;
        }

        .modal-body {
          padding: 24px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .modal-small,
          .modal-medium,
          .modal-large {
            width: 95%;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
