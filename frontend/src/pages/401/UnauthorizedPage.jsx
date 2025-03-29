import { useNavigate } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="flex justify-center">
          <ShieldX className="h-24 w-24 text-red-500" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          401 - Không có quyền truy cập
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Bạn không có quyền truy cập vào trang này.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 