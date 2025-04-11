import { X, LogOut } from "lucide-react";

interface SignOutConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SignOutConfirmation({ onConfirm, onCancel }: SignOutConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <LogOut className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-white">Sign Out</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-400 mb-6">
          Are you sure you want to sign out? You'll need to sign in again to access your profile and continue your fitness journey.
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-opacity-90"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
} 