import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2 } from 'lucide-react';
import { LineItem } from '../types/document';
import { calculateLineTotal, formatCurrency } from '../utils/calculations';

interface LineItemFormProps {
  item: LineItem;
  index: number;
  onUpdate: (id: string, updates: Partial<LineItem>) => void;
  onDelete: (id: string) => void;
}

export const LineItemForm: React.FC<LineItemFormProps> = ({
  item,
  index,
  onUpdate,
  onDelete,
}) => {
  const handleQuantityChange = (quantity: number) => {
    const total = calculateLineTotal(quantity, item.unitPrice);
    onUpdate(item.id, { quantity, total });
  };

  const handleUnitPriceChange = (unitPrice: number) => {
    const total = calculateLineTotal(item.quantity, unitPrice);
    onUpdate(item.id, { unitPrice, total });
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white border rounded-lg p-4 mb-3 transition-all duration-200 ${
            snapshot.isDragging ? 'shadow-lg scale-102' : 'shadow-sm'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              {...provided.dragHandleProps}
              className="flex-shrink-0 mt-2 cursor-move text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={20} />
            </div>
            
            <div className="flex-1 grid grid-cols-12 gap-4 items-start">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pos.
                </label>
                <div className="text-center py-2 bg-gray-50 rounded-md">
                  {item.position}
                </div>
              </div>
              
              <div className="col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={item.description}
                  onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Leistungsbeschreibung eingeben..."
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menge
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Einzelpreis
                </label>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gesamtpreis
                </label>
                <div className="py-2 px-3 bg-gray-50 rounded-md text-sm font-medium text-gray-800">
                  {formatCurrency(item.total)}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onDelete(item.id)}
              className="flex-shrink-0 mt-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Position löschen"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};