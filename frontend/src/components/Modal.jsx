import { X } from "lucide-react";
import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="text-white bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 
                      rounded-xl shadow-xl max-w-lg min-h-[30vh] max-h-[80vh] overflow-y-auto p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:text-red-500"
          >
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
