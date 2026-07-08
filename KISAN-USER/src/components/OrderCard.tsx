import { Package, MapPin, Calendar, Truck, CheckCircle, Clock, User, XCircle, QrCode, AlertCircle, CreditCard, ExternalLink } from 'lucide-react';
import { Order } from '../types';
import { useState, useEffect } from 'react';

interface OrderCardProps {
  order: Order;
  onCancel?: (orderId: string) => void;
  onTrack?: (order: Order) => void;
  onContact?: (order: Order) => void;
  onRate?: (order: Order) => void;
  onPaymentComplete?: (orderId: string) => void;
  onOrderUpdate?: () => void;
}

// QR Payment Modal Component
interface QRPaymentModalProps {
  order: Order;
  onClose: () => void;
  onPaymentComplete: (orderId: string) => void;
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({ order, onClose, onPaymentComplete }) => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isExpired, setIsExpired] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    if (order.paymentExpiry) {
      const expiryTime = new Date(order.paymentExpiry).getTime();
      const currentTime = new Date().getTime();
      const remainingTime = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
      setTimeLeft(remainingTime);
      if (remainingTime === 0) setIsExpired(true);
    } else {
      setTimeLeft(60);
    }
  }, [order.paymentExpiry]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    if (paymentStatus === 'pending' && !isProcessing) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, paymentStatus, isProcessing]);

  const handlePaymentComplete = async () => {
    if (isExpired || isProcessing) return;
    setIsProcessing(true);
    try {
      await onPaymentComplete(order._id);
      setPaymentStatus('success');
      setTimeout(() => onClose(), 3000);
    } catch (error) {
      setPaymentStatus('failed');
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalAmount = (order.finalAmount || order.productPrice) * (order.quantity || 1);

  const handleRetryPayment = () => {
    setTimeLeft(60);
    setPaymentStatus('pending');
    setIsExpired(false);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md flex flex-col" style={{ maxHeight: '95vh' }}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            {paymentStatus === 'success' ? 'Payment Successful!' :
              paymentStatus === 'failed' ? 'Payment Failed' : 'Complete Payment'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-6 space-y-4">
            {paymentStatus === 'success' ? (
              <div className="text-center py-6 sm:py-8">
                <div className="bg-green-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-green-600 mb-2">Payment Completed!</h4>
                <p className="text-gray-600 text-sm sm:text-base">Your order has been confirmed.</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">₹{totalAmount} has been paid successfully.</p>
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>Order Status:</strong> {order.deliveryType === 'home_delivery' ? 'Out for Delivery' : 'Confirmed'}
                  </p>
                </div>
              </div>
            ) : paymentStatus === 'failed' ? (
              <div className="text-center py-6 sm:py-8">
                <div className="bg-red-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-600" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-red-600 mb-2">Payment Failed</h4>
                <p className="text-gray-600 text-sm sm:text-base">There was an issue processing your payment.</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Please try again or contact support.</p>
              </div>
            ) : (
              <>
                {/* QR Code Display */}
                <div className="text-center">
                  <div className="bg-gray-100 p-4 sm:p-6 rounded-lg mb-4">
                    <div className="bg-white p-3 sm:p-4 rounded border-2 border-dashed border-gray-300 flex flex-col items-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                        alt="UPI Payment QR Code"
                        className="w-36 h-36 sm:w-48 sm:h-48 mx-auto mb-3 rounded-lg border border-gray-200 object-contain"
                      />
                      {!isExpired && (
                        <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Scan with any UPI app</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xl sm:text-2xl font-bold text-green-600 mb-1">₹{totalAmount}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {isExpired ? 'QR Code Expired' : `Valid for ${formatTime(timeLeft)}`}
                  </p>
                </div>

                {/* Payment Status */}
                {isExpired ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-center">
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 font-medium text-sm sm:text-base">QR Code Expired</p>
                    <p className="text-red-500 text-xs sm:text-sm mt-1">Please request a new payment link from the farmer</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <p className="text-green-600 font-medium text-sm sm:text-base">Waiting for Payment</p>
                    </div>
                    <p className="text-green-500 text-xs sm:text-sm">Complete payment within {formatTime(timeLeft)}</p>
                  </div>
                )}

                {/* Order Details */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Order Details</h4>
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600 flex-shrink-0">Product:</span>
                      <span className="font-medium text-right">{order.productName}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600 flex-shrink-0">Quantity:</span>
                      <span className="font-medium">{order.quantity || 1} {order.unit || 'item'}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600 flex-shrink-0">Delivery:</span>
                      <span className="font-medium capitalize">
                        {order.deliveryType?.replace('_', ' ') || 'pickup'}
                      </span>
                    </div>
                    {order.deliveryCharge > 0 && (
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600 flex-shrink-0">Delivery Charge:</span>
                        <span className="font-medium">₹{order.deliveryCharge}</span>
                      </div>
                    )}
                    <div className="border-t pt-1.5 mt-1">
                      <div className="flex justify-between font-semibold gap-2">
                        <span className="flex-shrink-0">Total Amount:</span>
                        <span className="text-green-600">₹{totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <h5 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">How to Pay:</h5>
                  <ol className="text-xs sm:text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Open any UPI app on your phone</li>
                    <li>Tap on "Scan QR Code"</li>
                    <li>Point your camera at the QR code above</li>
                    <li>Confirm the payment details and complete the transaction</li>
                    <li>Click "I Have Paid" below to confirm</li>
                  </ol>
                </div>

                {/* Alternative Payment Methods */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">Other Payment Options:</h5>
                  <div className="text-xs sm:text-sm text-yellow-700 space-y-1">
                    <p><strong>UPI ID:</strong> farmer@upi</p>
                    <p><strong>PhonePe:</strong> Open PhonePe → Pay → Enter UPI ID</p>
                    <p><strong>Google Pay:</strong> Open GPay → New Payment → Enter UPI ID</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-white flex-shrink-0">
          {paymentStatus === 'success' ? (
            <button
              onClick={onClose}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Continue
            </button>
          ) : paymentStatus === 'failed' ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleRetryPayment}
                className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-3 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentComplete}
                disabled={isExpired || isProcessing}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                  isExpired || isProcessing
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>I Have Paid</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function OrderCard({ order, onCancel, onTrack, onContact, onRate, onPaymentComplete, onOrderUpdate }: OrderCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending Approval' };
      case 'payment_pending':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: QrCode, label: 'Payment Required' };
      case 'confirmed':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, label: 'Confirmed' };
      case 'delivery':
        return { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: Truck, label: 'Out for Delivery' };
      case 'completed':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Completed' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Rejected' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Package, label: 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig(currentOrder.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string) => {
    try {
      let date: Date;
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateString);
      }
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getUnitPrice = () => currentOrder.finalAmount || currentOrder.productPrice || 0;
  const getQuantity = () => (currentOrder.quantity && currentOrder.quantity > 0 ? currentOrder.quantity : 1);
  const getTotalPrice = () => getQuantity() * getUnitPrice();
  const getUnit = () => currentOrder.unit || 'item';

  const decimalToDMS = (deg: number, isLat: boolean) => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
    const direction = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  const getGoogleMapsLink = (location: { lat: number; lng: number; address: string } | undefined) => {
    if (!location || !location.lat || !location.lng) return null;
    const latDMS = decimalToDMS(location.lat, true);
    const lngDMS = decimalToDMS(location.lng, false);
    return `https://www.google.com/maps/place/${encodeURIComponent(latDMS)}+${encodeURIComponent(lngDMS)}/@${location.lat},${location.lng},17z/data=!3m1!4b1!4m4!3m3!8m2!3d${location.lat}!4d${location.lng}?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D`;
  };

  const getGoogleMapsLinkFromAddress = (address: string) => {
    if (!address) return null;
    let cleanAddress = address.includes('Location:') ? address.replace('Location:', '').trim() : address;
    if (cleanAddress.includes(',')) {
      const coordMatch = cleanAddress.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (coordMatch) return `https://www.google.com/maps/search/?api=1&query=${coordMatch[1]},${coordMatch[2]}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;
  };

  const cleanAddressDisplay = (address: string) => {
    if (!address) return '';
    return address.includes('Location:') ? address.replace('Location:', '').trim() : address;
  };

  const handlePaymentClick = () => setShowPaymentModal(true);

  const handlePaymentComplete = async (orderId: string) => {
    if (onPaymentComplete) {
      try {
        await onPaymentComplete(orderId);
        setCurrentOrder(prev => ({
          ...prev,
          status: prev.deliveryType === 'home_delivery' ? 'delivery' : 'confirmed',
          paymentStatus: 'completed'
        }));
        if (onOrderUpdate) setTimeout(onOrderUpdate, 1000);
      } catch (error) {
        throw error;
      }
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    if (onOrderUpdate) setTimeout(onOrderUpdate, 500);
  };

  const isPaymentExpired = currentOrder.paymentExpiry && new Date(currentOrder.paymentExpiry) < new Date();

  const customerMapsLink = currentOrder.customerLocation
    ? getGoogleMapsLink(currentOrder.customerLocation)
    : getGoogleMapsLinkFromAddress(currentOrder.deliveryLocation || '');

  const farmerMapsLink = currentOrder.farmerLocation
    ? getGoogleMapsLink(currentOrder.farmerLocation)
    : getGoogleMapsLinkFromAddress(currentOrder.deliveryLocation || '');

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">

        {/* Order Header */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                {currentOrder.productName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span>ID: {currentOrder._id?.substring(0, 8)}...</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(currentOrder.date)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${statusConfig.color}`}>
              <StatusIcon className="h-3 w-3" />
              <span className="hidden xs:inline sm:inline">{statusConfig.label}</span>
            </span>
          </div>
        </div>

        {/* Mobile status label (shown below header on very small screens) */}
        <div className="mb-3 -mt-2 sm:hidden">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </span>
        </div>

        {/* Payment Status Alerts */}
        {currentOrder.status === 'payment_pending' && (
          <div className="mb-4 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-2">
                <QrCode className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800 text-sm sm:text-base">Payment Required</p>
                  <p className="text-xs sm:text-sm text-orange-600">
                    {isPaymentExpired ? 'QR Code has expired' : 'Complete payment to confirm your order'}
                  </p>
                  {currentOrder.paymentExpiry && !isPaymentExpired && (
                    <p className="text-xs text-orange-500 mt-0.5">
                      Expires: {new Date(currentOrder.paymentExpiry).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handlePaymentClick}
                disabled={isPaymentExpired}
                className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  isPaymentExpired
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>{isPaymentExpired ? 'Expired' : 'Pay Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Payment Success Alert */}
        {currentOrder.paymentStatus === 'completed' && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800 text-sm sm:text-base">Payment Completed</p>
                <p className="text-xs sm:text-sm text-green-600">
                  Your order is now {currentOrder.status === 'delivery' ? 'out for delivery' : 'confirmed'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="mb-4 space-y-2 text-sm">
          {/* Row: Unit Price */}
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <span className="text-gray-500">Unit Price</span>
            <span className="font-medium text-gray-900">₹{getUnitPrice()}</span>
          </div>

          {/* Row: Quantity */}
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <span className="text-gray-500">Quantity</span>
            <span className="font-medium text-gray-900">{getQuantity()} {getUnit()}</span>
          </div>

          {/* Row: Delivery Charge */}
          {currentOrder.deliveryCharge > 0 && (
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-gray-500">Delivery Charge</span>
              <span className="font-medium text-gray-900">₹{currentOrder.deliveryCharge}</span>
            </div>
          )}

          {/* Row: Delivery Type */}
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <span className="text-gray-500">Delivery Type</span>
            <span className="font-medium text-gray-900 capitalize">
              {currentOrder.deliveryType?.replace('_', ' ') || 'pickup'}
            </span>
          </div>

          {/* Row: Farmer */}
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <span className="text-gray-500 flex items-center gap-1">
              <User className="h-3 w-3" />
              Farmer
            </span>
            <span className="font-medium text-gray-900">{currentOrder.farmerName}</span>
          </div>

          {/* Row: Delivery Location */}
          {currentOrder.deliveryLocation && (
            <div className="py-1 border-b border-gray-50">
              <div className="flex items-center gap-1 text-gray-500 mb-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span>Delivery Location</span>
              </div>
              <div className="pl-4">
                <p className="font-medium text-gray-900 text-xs sm:text-sm break-words">
                  {cleanAddressDisplay(currentOrder.deliveryLocation)}
                </p>
                {customerMapsLink && (
                  <a
                    href={customerMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Row: Pickup Location */}
          {currentOrder.farmerLocation && currentOrder.deliveryType === 'pickup' && (
            <div className="py-1 border-b border-gray-50">
              <div className="flex items-center gap-1 text-gray-500 mb-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span>Pickup Location</span>
              </div>
              <div className="pl-4">
                <p className="font-medium text-gray-900 text-xs sm:text-sm break-words">
                  {cleanAddressDisplay(currentOrder.farmerLocation.address)}
                </p>
                {farmerMapsLink && (
                  <a
                    href={farmerMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Row: Customer Location (home delivery) */}
          {currentOrder.customerLocation?.address && currentOrder.deliveryType === 'home_delivery' && (
            <div className="py-1 border-b border-gray-50">
              <div className="flex items-center gap-1 text-gray-500 mb-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span>Customer Location</span>
              </div>
              <div className="pl-4">
                <p className="font-medium text-gray-900 text-xs sm:text-sm break-words">
                  {cleanAddressDisplay(currentOrder.customerLocation.address)}
                </p>
                {customerMapsLink && (
                  <a
                    href={customerMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open in Google Maps
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {currentOrder.customerLocation.lat?.toFixed(6)}, {currentOrder.customerLocation.lng?.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Total Amount */}
        <div className="flex justify-between items-center pt-3 pb-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Total ({getQuantity()} {getUnit()})
          </div>
          <div className="text-lg sm:text-xl font-bold text-green-700">
            ₹{getTotalPrice()}
          </div>
        </div>

        {/* Order Actions */}
        <div className="pt-3 border-t border-gray-200 flex flex-col xs:flex-row flex-wrap gap-2 sm:gap-3">
          {currentOrder.status === 'pending' && (
            <>
              <button
                onClick={() => onTrack?.(currentOrder)}
                className="flex-1 min-w-0 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center"
              >
                Track Order
              </button>
              <button
                onClick={() => onCancel?.(currentOrder._id)}
                className="flex-1 min-w-0 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium text-center"
              >
                Cancel Order
              </button>
            </>
          )}

          {currentOrder.status === 'payment_pending' && (
            <button
              onClick={handlePaymentClick}
              disabled={isPaymentExpired}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                isPaymentExpired
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>{isPaymentExpired ? 'QR Expired' : 'Pay Now'}</span>
            </button>
          )}

          {(currentOrder.status === 'confirmed' || currentOrder.status === 'delivery') && (
            <button
              onClick={() => onTrack?.(currentOrder)}
              className="flex-1 min-w-0 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center"
            >
              {currentOrder.status === 'delivery' ? 'View Tracking' : 'Track Order'}
            </button>
          )}

          {currentOrder.status === 'completed' && (
            <button
              onClick={() => onRate?.(currentOrder)}
              className="flex-1 min-w-0 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center"
            >
              Rate & Review
            </button>
          )}

          <button
            onClick={() => onContact?.(currentOrder)}
            className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-center"
          >
            Contact Farmer
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <QRPaymentModal
          order={currentOrder}
          onClose={handleClosePaymentModal}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}
