import React, { useState } from "react";
import OrderCompletePage from "./OrderCompletePage";

// --- Order ID Generator ---
const getNextOrderId = () => `ETRFS${Date.now()}`;

// --- Previous Orders Page ---
const PreviousOrdersPage = ({ onBack }) => (
  <div className="container text-center py-5" style={{ marginTop: "120px" }}>
    <h2 className="fw-bold mb-3 text-primary">Previous Orders</h2>
    <p className="text-muted">No previous orders stored locally.</p>
    <button onClick={onBack} className="btn btn-outline-primary mt-4 px-4">
      ← Back to Order Complete
    </button>
  </div>
);

// --- Main Checkout Component ---
const CheckoutDetailsPage = ({ product, onBackToCart }) => {
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    billingAddress: product.details.SelectedAddress || "",
  });

  const [checkoutStep, setCheckoutStep] = useState("checkout");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [finalOrderId, setFinalOrderId] = useState(null);

  const handleFormChange = (e) =>
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });

  const handleViewPreviousOrders = () => {
    setCheckoutStep("orders");
    window.scrollTo(0, 0);
  };

  const handleBackFromOrders = () => {
    setCheckoutStep("complete");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsPlacingOrder(true);

    const orderId = getNextOrderId();
    const total = product.calculatedTotal;
    const BACKEND_URL = "http://localhost:5000";

    const orderData = {
      order_number: orderId,
      first_name: customerDetails.firstName || "N/A",
      last_name: customerDetails.lastName || "N/A",
      customer_email: customerDetails.email || "N/A",
      customer_phone: customerDetails.phone || "N/A",
      product_name: product.name || "N/A",
      product_quantity: product.quantity || 1,
      product_reports_selected: product.details.SelectedReports || "N/A",
      total_paid: total || 0,
      shipping_address: customerDetails.billingAddress || "N/A",
      primary_pitch: product.details.PrimaryPitch || "N/A",
      secondary_pitch: product.details.SecondaryPitch || "N/A",
      number_of_facets: product.details.NumberOfFacets || "N/A",
      latitude: product.details.Latitude || "N/A",
      longitude: product.details.Longitude || "N/A",
      is_expedited: product.details.Expedited ? "Yes" : "No",
      notes: product.details.Notes || "No additional notes provided.",
    };

    try {
      const serverResponse = await fetch(`${BACKEND_URL}/send-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (serverResponse.ok) {
        setFinalOrderId(orderId);
        setCheckoutStep("complete");
        window.scrollTo(0, 0);
      } else {
        alert(`Order failed. Please try again. Server Status: ${serverResponse.status}`);
      }
    } catch (err) {
      alert("Network error. Please ensure backend is running.");
      console.error(err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (checkoutStep === "orders") return <PreviousOrdersPage onBack={handleBackFromOrders} />;

  if (checkoutStep === "complete") {
    const finalOrderDetails = {
      orderId: finalOrderId,
      product: {
        name: product.name,
        quantity: product.quantity,
        calculatedTotal: product.calculatedTotal,
      },
    };
    return (
      <OrderCompletePage
        orderDetails={finalOrderDetails}
        onViewOtherOrders={handleViewPreviousOrders}
        onBackToHome={() => (window.location.href = "/")}
      />
    );
  }

  const total = product?.calculatedTotal || 0;

  return (
    <div className="checkout-page container py-5" style={{ marginTop: "100px" }}>
      <div
        className="checkout-header text-center text-white py-4 mb-5 rounded-4 shadow-sm"
        style={{
          background: "linear-gradient(90deg, #007BFF, #6610f2)",
        }}
      >
        <h2 className="fw-bold mb-0">Secure Checkout</h2>
        <p className="mb-0">Complete your order details below</p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Checkout Form */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-lg p-4 rounded-4">
            <h4 className="fw-semibold mb-4 text-primary">Billing Details</h4>
            <form onSubmit={handlePlaceOrder}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">First Name</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="firstName"
                    value={customerDetails.firstName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="lastName"
                    value={customerDetails.lastName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    name="email"
                    value={customerDetails.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone</label>
                  <input
                    type="tel"
                    className="form-control form-control-lg"
                    name="phone"
                    value={customerDetails.phone}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Billing Address</label>
                  <textarea
                    className="form-control form-control-lg"
                    name="billingAddress"
                    value={customerDetails.billingAddress}
                    onChange={handleFormChange}
                    rows="2"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mt-4 py-3 fw-semibold shadow-sm"
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100 mt-3 py-3 fw-semibold"
                onClick={onBackToCart}
              >
                ← Back to Cart
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-lg rounded-4 p-4 sticky-top" style={{ top: "100px" }}>
            <h5 className="fw-bold text-primary mb-3">Order Summary</h5>
            <hr />
            <p><strong>Product:</strong> {product.name}</p>
            <p><strong>Quantity:</strong> {product.quantity}</p>
            <p><strong>Reports:</strong> {product.details.SelectedReports}</p>
            <p><strong>Billing Address:</strong> {customerDetails.billingAddress}</p>
            <div className="d-flex justify-content-between mt-4">
              <h5 className="fw-bold mb-0">Total:</h5>
              <h5 className="fw-bold text-success mb-0">${total}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailsPage;
