import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCopy, FaCheckCircle, FaSpinner } from "react-icons/fa";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";

const PaymentQRPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, success, failed
  const paymentDetails = location.state?.paymentDetails;

  // Giả lập kiểm tra trạng thái thanh toán
  useEffect(() => {
    const checkPaymentStatus = () => {
      // Trong thực tế, đây sẽ là API call để kiểm tra trạng thái
      setTimeout(() => {
        setPaymentStatus("success");
        navigate("/order-success", {
          state: {
            orderDetails: {
              orderId: paymentDetails?.orderId,
              total: paymentDetails?.amount,
              paymentMethod: paymentDetails?.method,
            },
          },
        });
      }, 10000); // Giả lập đợi 10 giây
    };

    if (paymentStatus === "pending") {
      checkPaymentStatus();
    }
  }, [paymentStatus, navigate, paymentDetails]);

  const handleCopyCode = () => {
    if (paymentDetails?.transferCode) {
      navigator.clipboard.writeText(paymentDetails.transferCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPaymentMethodInfo = () => {
    switch (paymentDetails?.method) {
      case "momo":
        return {
          name: "Ví MoMo",
          color: "text-[#A50064]",
          qrImage: "qr-momo.jpg",
        };
      case "vnpay":
        return {
          name: "VNPay",
          color: "text-[#1A1F71]",
          qrImage: "qr-momo.jpg",
        };
      case "zalopay":
        return {
          name: "ZaloPay",
          color: "text-[#0068FF]",
          qrImage: "qr-momo.jpg",
        };
      case "bank":
        return {
          name: "Chuyển khoản ngân hàng",
          color: "text-cyan-600",
          qrImage: "qr-momo.jpg",
        };
      default:
        return {
          name: "Thanh toán",
          color: "text-gray-800 dark:text-white",
          qrImage: "",
        };
    }
  };

  const methodInfo = getPaymentMethodInfo();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Navbar />

      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1
            className={`text-2xl font-bold mb-6 text-center ${methodInfo.color}`}
          >
            Thanh toán qua {methodInfo.name}
          </h1>

          <div className="text-center mb-8">
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <img
                src={`/${methodInfo.qrImage}`}
                alt={`QR Code ${methodInfo.name}`}
                className="w-64 h-64 mx-auto"
              />
            </div>

            {paymentDetails?.transferCode && (
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Mã chuyển khoản:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded text-lg font-mono">
                    {paymentDetails.transferCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 text-gray-500 hover:text-cyan-600 transition-colors"
                  >
                    {copied ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaCopy />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>Số tiền: {paymentDetails?.amount?.toLocaleString()}đ</p>
              <p>Mã đơn hàng: #{paymentDetails?.orderId}</p>
            </div>
          </div>

          <div className="text-center">
            {paymentStatus === "pending" ? (
              <div className="flex items-center justify-center gap-3 text-cyan-600">
                <FaSpinner className="animate-spin" />
                <span>Đang chờ thanh toán...</span>
              </div>
            ) : null}

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Vui lòng không tắt trang này cho đến khi hoàn tất thanh toán
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentQRPage;
