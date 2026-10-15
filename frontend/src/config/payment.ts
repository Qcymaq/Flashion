// Bank transfer details shown at checkout, on the payment confirmation page
// and in the membership upgrade dialog.
//
// The real values are read from build-time environment variables (see
// frontend/.env.example) so that account data is not committed to the public
// repository. When they are not set, the UI shows a neutral message instead.
export const bankTransferDetails = {
  bankName: process.env.REACT_APP_BANK_NAME || '',
  accountNumber: process.env.REACT_APP_BANK_ACCOUNT_NUMBER || '',
  accountHolder: process.env.REACT_APP_BANK_ACCOUNT_HOLDER || '',
  qrImageUrl: process.env.REACT_APP_BANK_QR_URL || '',
};

export const hasBankTransferDetails = Boolean(bankTransferDetails.accountNumber);

// English: "Payment details are provided after ordering. Please contact the shop."
// (Kept in Vietnamese to match the rest of the user interface.)
export const PAYMENT_DETAILS_UNAVAILABLE_MESSAGE =
  'Thông tin thanh toán sẽ được cung cấp sau khi đặt hàng. Vui lòng liên hệ cửa hàng.';

// Shown on the payment confirmation page, after the order was placed, when no
// bank details are configured.
// English: "Your order has been received. The shop will contact you with the
// payment details."
export const PAYMENT_DETAILS_AFTER_ORDER_MESSAGE =
  'Đơn hàng của bạn đã được ghi nhận. Cửa hàng sẽ liên hệ với bạn để cung cấp thông tin thanh toán.';
