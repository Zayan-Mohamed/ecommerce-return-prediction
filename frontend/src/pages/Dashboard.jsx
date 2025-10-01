import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardHeader from "../components/layout/DashboardHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import apiService from "../services/apiService";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Initialize with empty/default states instead of hardcoded data
  const [stats, setStats] = useState({
    totalOrders: 0,
    predictedReturns: 0,
    returnRate: 0,
    revenueSaved: 0,
    accuracy: 0,
  });

  const [recentPredictions, setRecentPredictions] = useState([]);

  const [quickPrediction, setQuickPrediction] = useState({
    productCategory: "",
    productPrice: "",
    orderQuantity: "",
    userAge: "",
    userGender: "",
    userLocation: "",
    paymentMethod: "",
    shippingMethod: "",
    discountApplied: "",
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");

  const loadAnalyticsData = useCallback(async () => {
    try {
      // Load dashboard data from analytics API
      const dashboardData = await apiService.getDashboardData();
      if (dashboardData && dashboardData.success && dashboardData.data) {
        const kpis = dashboardData.data.kpis;
        const riskDist = dashboardData.data.risk_distribution_7d;

        // Calculate total orders and return data
        const totalRiskOrders = riskDist
          ? (riskDist.high_risk?.count || 0) +
            (riskDist.medium_risk?.count || 0)
          : 0;

        const totalAllOrders = riskDist
          ? (riskDist.high_risk?.count || 0) +
            (riskDist.medium_risk?.count || 0) +
            (riskDist.low_risk?.count || 0)
          : 0;

        const returnRate =
          totalAllOrders > 0
            ? (riskDist.high_risk?.percentage || 0) +
              (riskDist.medium_risk?.percentage || 0)
            : 0;

        // Update stats with real data, fallback to defaults if no data
        setStats({
          totalOrders: kpis?.total_predictions_30d || 0,
          predictedReturns: totalRiskOrders || 0,
          returnRate: returnRate || 0,
          revenueSaved: kpis?.total_revenue_saved_lifetime || 0,
          accuracy:
            kpis?.model_accuracy_latest !== "N/A"
              ? parseFloat(kpis.model_accuracy_latest) || 0
              : 0,
        });
      } else {
        console.log("No valid dashboard data received, using defaults");
      }
    } catch (error) {
      console.error("Failed to load analytics data:", error);
      // Keep default values if analytics fails
    }
  }, []);

  const checkBackendHealth = useCallback(async () => {
    try {
      const isAvailable = await apiService.isBackendAvailable();
      setBackendStatus(isAvailable ? "healthy" : "unhealthy");

      if (isAvailable) {
        // Load analytics data when backend is healthy
        loadAnalyticsData();
      }
    } catch (error) {
      console.error("Health check failed:", error);
      setBackendStatus("unhealthy");
    }
  }, [loadAnalyticsData]);

  // Check backend health on component mount only
  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  const handleQuickPredictionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictionResult(null);

    try {
      // Transform form data to API format
      const orderData = apiService.transformOrderData(quickPrediction);

      // Make prediction request
      const response = await apiService.processOrder(orderData);

      if (response.success) {
        const probability = Math.round(
          response.prediction.return_probability * 100
        );
        const riskLevel = response.risk_level;

        setPredictionResult({
          probability,
          riskLevel,
          confidence: Math.round(response.confidence * 100),
          recommendations: response.recommendations || [],
          factors: [
            {
              factor: "Product Category",
              impact: "Medium",
              value: quickPrediction.productCategory,
            },
            {
              factor: "Price Range",
              impact: "High",
              value: `$${quickPrediction.productPrice}`,
            },
            {
              factor: "User Location",
              impact: "Low",
              value: quickPrediction.userLocation,
            },
            {
              factor: "Payment Method",
              impact: "Medium",
              value: quickPrediction.paymentMethod,
            },
          ],
        });

        // Add to recent predictions
        const newPrediction = {
          id: response.order_id,
          product: `${quickPrediction.productCategory} Item`,
          category: quickPrediction.productCategory,
          price: parseFloat(quickPrediction.productPrice),
          prediction:
            riskLevel === "LOW"
              ? "Low Risk"
              : riskLevel === "MEDIUM"
              ? "Medium Risk"
              : "High Risk",
          probability,
          date: new Date().toISOString().split("T")[0],
          status: "processed",
        };

        setRecentPredictions((prev) => [newPrediction, ...prev.slice(0, 4)]);
      } else {
        throw new Error(response.error || "Prediction failed");
      }
    } catch (error) {
      console.error("Prediction failed:", error);
      setPredictionResult({
        error: true,
        message: error.message || "Failed to get prediction. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuickPrediction({
      ...quickPrediction,
      [e.target.name]: e.target.value,
    });
  };

  const [predictions, _setPredictions] = useState([]);

  useEffect(() => {
    // Update stats when predictions change
    if (predictions.length > 0) {
      const totalOrders = predictions.length;
      const predictedReturns = predictions.filter(
        (p) => p.return_probability > 0.5
      ).length;
      const riskOrders = predictions.filter(
        (p) => p.return_probability > 0.7
      ).length;

      setStats({
        totalOrders,
        predictedReturns,
        riskOrders,
        accuracy: 0, // No hardcoded accuracy value
      });
    }
  }, [predictions]);
  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
        <div className="max-w-full mx-auto px-6 xl:px-12 2xl:px-16">
          {/* Header */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-white/20">
            <CardHeader className="relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-xl"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <CardTitle className="text-4xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-3">
                    Welcome back,{" "}
                    {user?.user_metadata?.full_name ||
                      user?.email?.split("@")[0] ||
                      "User"}
                    !
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-lg font-medium">
                    Here's your return prediction overview for today
                  </CardDescription>
                  {/* Backend Status Indicator */}
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        backendStatus === "healthy"
                          ? "bg-green-500"
                          : backendStatus === "unhealthy"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <span className="text-sm text-slate-500">
                      API Status:{" "}
                      {backendStatus === "healthy"
                        ? "Connected"
                        : backendStatus === "unhealthy"
                        ? "Disconnected"
                        : "Checking..."}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 relative z-10">
                  <Button variant="outline" className="flex items-center gap-3">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export Report
                  </Button>
                  <Button className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add New Order
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-600 to-amber-700"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600 to-amber-700 flex items-center justify-center text-white shadow-lg">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 3v5h5M3.05 13a9 9 0 1 0 1.5-5.5" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.totalOrders.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Predicted Returns
                </CardTitle>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.predictedReturns}
                </div>
                <p className="text-xs text-muted-foreground">
                  High risk orders
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Return Rate
                </CardTitle>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.returnRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall return rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenue Saved
                </CardTitle>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white shadow-lg">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  ${stats.revenueSaved.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From predictions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Quick Prediction */}
            <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  Quick Prediction
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium">
                  Get instant return probability for an order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleQuickPredictionSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Category
                      </label>
                      <select
                        name="productCategory"
                        value={quickPrediction.productCategory}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Sports">Sports</option>
                        <option value="Home">Home & Garden</option>
                        <option value="Books">Books</option>
                        <option value="Beauty">Beauty</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Price ($)
                      </label>
                      <input
                        type="number"
                        name="productPrice"
                        value={quickPrediction.productPrice}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Quantity
                      </label>
                      <input
                        type="number"
                        name="orderQuantity"
                        value={quickPrediction.orderQuantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="1"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Age
                      </label>
                      <input
                        type="number"
                        name="userAge"
                        value={quickPrediction.userAge}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="25"
                        min="18"
                        max="100"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Gender
                      </label>
                      <select
                        name="userGender"
                        value={quickPrediction.userGender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Location
                      </label>
                      <select
                        name="userLocation"
                        value={quickPrediction.userLocation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select location</option>
                        <option value="Urban">Urban</option>
                        <option value="Suburban">Suburban</option>
                        <option value="Rural">Rural</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        name="paymentMethod"
                        value={quickPrediction.paymentMethod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select payment</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Cash on Delivery">
                          Cash on Delivery
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Method
                      </label>
                      <select
                        name="shippingMethod"
                        value={quickPrediction.shippingMethod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select shipping</option>
                        <option value="Standard">Standard</option>
                        <option value="Express">Express</option>
                        <option value="Next Day">Next Day</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Applied (%)
                    </label>
                    <input
                      type="number"
                      name="discountApplied"
                      value={quickPrediction.discountApplied}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          className="mr-2"
                        >
                          <path d="M9 19c-5 0-8-3-8-6s3-6 8-6c1.25 0 2.45.21 3.58.58A5 5 0 0 1 16 6c2.76 0 5 2.24 5 5s-2.24 5-5 5c-1.38 0-2.63-.56-3.54-1.46A13.85 13.85 0 0 1 9 19z" />
                        </svg>
                        Predict Return Risk
                      </>
                    )}
                  </Button>
                </form>

                {predictionResult && (
                  <div className="mt-8">
                    {predictionResult.error ? (
                      <Alert variant="destructive">
                        <AlertTitle>Prediction Failed</AlertTitle>
                        <AlertDescription>
                          {predictionResult.message}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-gray-800">
                            Prediction Result
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center justify-center">
                            <Badge
                              variant={
                                predictionResult.riskLevel === "HIGH"
                                  ? "danger"
                                  : predictionResult.riskLevel === "MEDIUM"
                                  ? "warning"
                                  : "success"
                              }
                              className="text-sm font-semibold"
                            >
                              {predictionResult.riskLevel === "HIGH"
                                ? "High Risk"
                                : predictionResult.riskLevel === "MEDIUM"
                                ? "Medium Risk"
                                : "Low Risk"}
                            </Badge>
                            <div className="ml-8 relative">
                              <svg width="80" height="80" viewBox="0 0 80 80">
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="35"
                                  fill="none"
                                  stroke="#e2e8f0"
                                  strokeWidth="8"
                                />
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="35"
                                  fill="none"
                                  stroke={
                                    predictionResult.riskLevel === "HIGH"
                                      ? "#e53e3e"
                                      : predictionResult.riskLevel === "MEDIUM"
                                      ? "#ed8936"
                                      : "#38a169"
                                  }
                                  strokeWidth="8"
                                  strokeDasharray={`${
                                    predictionResult.probability * 2.2
                                  } 220`}
                                  strokeDashoffset="0"
                                  transform="rotate(-90 40 40)"
                                  className="transition-all duration-500"
                                />
                              </svg>
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className="block text-xl font-bold text-gray-800">
                                  {predictionResult.probability}%
                                </span>
                                <span className="text-sm text-gray-600">
                                  Return Risk
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-center">
                            <Progress
                              value={predictionResult.confidence}
                              className="w-full h-2"
                            />
                            <div className="text-sm text-gray-600 mt-2">
                              Confidence: {predictionResult.confidence}%
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">
                              Key Factors
                            </h4>
                            <div className="space-y-3">
                              {predictionResult.factors.map((factor, index) => (
                                <Card key={index} className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="text-sm font-medium text-gray-800">
                                        {factor.factor}
                                      </span>
                                      <span className="text-sm text-gray-600 ml-2">
                                        {factor.value}
                                      </span>
                                    </div>
                                    <Badge
                                      variant={
                                        factor.impact === "High"
                                          ? "danger"
                                          : factor.impact === "Medium"
                                          ? "warning"
                                          : "success"
                                      }
                                      className="text-xs"
                                    >
                                      {factor.impact}
                                    </Badge>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Predictions */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                    Recent Predictions
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 py-3 px-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                    <div>Order ID</div>
                    <div>Product</div>
                    <div>Prediction</div>
                    <div>Risk %</div>
                    <div>Status</div>
                  </div>
                  <div className="space-y-2">
                    {recentPredictions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No predictions yet. Make your first prediction above!
                      </div>
                    ) : (
                      recentPredictions.map((prediction) => (
                        <div
                          key={prediction.id}
                          className="grid grid-cols-5 gap-4 py-4 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">
                              {prediction.id}
                            </span>
                            <span className="text-xs text-gray-500">
                              {prediction.date}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">
                              {prediction.product}
                            </span>
                            <span className="text-xs text-gray-500">
                              {prediction.category}
                            </span>
                          </div>
                          <div>
                            <Badge
                              variant={
                                prediction.prediction === "High Risk"
                                  ? "danger"
                                  : prediction.prediction === "Medium Risk"
                                  ? "warning"
                                  : "success"
                              }
                            >
                              {prediction.prediction}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={prediction.probability}
                              className="flex-1 h-2"
                            />
                            <span className="text-sm font-medium text-gray-600">
                              {prediction.probability}%
                            </span>
                          </div>
                          <div>
                            <Badge
                              variant={
                                prediction.status === "processed"
                                  ? "success"
                                  : "default"
                              }
                            >
                              {prediction.status === "processed"
                                ? "Processed"
                                : "Processing"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Model Performance
                </CardTitle>
                <div className="flex gap-6">
                  <div className="text-center">
                    <span className="block text-sm text-gray-500">
                      Accuracy
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {stats.accuracy}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-sm text-gray-500">
                      Predictions Today
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {stats.totalOrders || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-end justify-center gap-2 h-40 mb-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-8 rounded-t-sm mb-2"
                      style={{ height: "60%" }}
                    ></div>
                    <span className="text-xs text-gray-600">Mon</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-8 rounded-t-sm mb-2"
                      style={{ height: "80%" }}
                    ></div>
                    <span className="text-xs text-gray-600">Tue</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-8 rounded-t-sm mb-2"
                      style={{ height: "45%" }}
                    ></div>
                    <span className="text-xs text-gray-600">Wed</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-8 rounded-t-sm mb-2"
                      style={{ height: "90%" }}
                    ></div>
                    <span className="text-xs text-gray-600">Thu</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-8 rounded-t-sm mb-2"
                      style={{ height: "70%" }}
                    ></div>
                    <span className="text-xs text-gray-600">Fri</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-8 rounded-t-sm mb-2"
                      style={{ height: "85%" }}
                    ></div>
                    <span className="text-xs text-gray-600">Sat</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-8 rounded-t-sm mb-2"
                      style={{ height: "65%" }}
                    ></div>
                    <span className="text-xs text-gray-600">Sun</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">
                      Daily Predictions
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
