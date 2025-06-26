import { useNavigate } from "react-router-dom";

export default function ErrorScreen({ title, message, onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-base-gradient flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-white mb-4">{message}</p>
        <button onClick={handleBack} className="text-white hover:text-gray-400 font-medium">
          ← Back
        </button>
      </div>
    </div>
  );
}
