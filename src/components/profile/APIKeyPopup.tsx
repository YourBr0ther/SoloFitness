import { X, ClipboardPaste, Loader2, Save } from "lucide-react";
import { useState } from "react";

interface APIKeyPopupProps {
  apiKey: string;
  onClose: () => void;
  onSave: (newKey: string) => void;
}

export default function APIKeyPopup({ apiKey, onClose, onSave }: APIKeyPopupProps) {
  const [pasted, setPasted] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [newKey, setNewKey] = useState(apiKey);

  const getKeyType = (key: string) => {
    if (key.startsWith("sk-ant-")) {
      return "Claude";
    } else if (key.startsWith("sk-")) {
      return "OpenAI";
    }
    return "Unknown";
  };

  const keyType = getKeyType(newKey);
  const keyTypeColor = keyType === "Claude" ? "text-[#FFA500]" : keyType === "OpenAI" ? "text-[#00A8FF]" : "text-gray-400";

  const handlePaste = async () => {
    try {
      setIsPasting(true);
      const clipboardText = await navigator.clipboard.readText();
      setNewKey(clipboardText);
      setPasted(true);
      setTimeout(() => setPasted(false), 2000);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    } finally {
      setIsPasting(false);
    }
  };

  const handleSave = () => {
    onSave(newKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Virtual Coach Setup</h2>
            <p className={`text-sm ${keyTypeColor}`}>{keyType} API Key</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-400 mb-2">Paste your API key below to enable your virtual coach:</p>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-gray-800 text-gray-300 p-2 rounded-lg overflow-x-auto">
              {newKey}
            </code>
            <button
              onClick={handlePaste}
              className="bg-[#00A8FF] text-white p-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              aria-label="Paste API key"
              disabled={isPasting}
            >
              {isPasting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ClipboardPaste size={20} />
              )}
            </button>
          </div>
          {pasted && (
            <p className="text-[#00A8FF] text-sm mt-2">API key pasted successfully!</p>
          )}
        </div>

        <div className="text-sm text-gray-400 mb-4">
          <p className="mb-2">Your virtual coach will help you:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Get personalized workout guidance</li>
            <li>Stay motivated with AI encouragement</li>
            <li>Track your progress and suggest improvements</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-[#00A8FF] text-white rounded-lg hover:bg-opacity-90"
            aria-label="Save API key"
          >
            <Save size={20} />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
} 