import { useNavigate } from "react-router-dom";
import { WifiOff } from "lucide-react";

const ErrorFallbackPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full border border-gray-200">
        <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Connection Lost
        </h1>
        <p className="text-gray-600 mb-6">
          It seems you are offline or the server is not responding.  
          Please check your network and try again.
        </p>
       
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors duration-200 w-full"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ErrorFallbackPage;
