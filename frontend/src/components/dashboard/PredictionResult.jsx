import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const PredictionResult = ({ result, showFactors = true }) => {
  if (!result) return null;

  const { probability, riskLevel, confidence, recommendations, factors } =
    result;

  const getRiskColor = (risk) => {
    switch (risk?.toUpperCase()) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk?.toUpperCase()) {
      case "HIGH":
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      case "MEDIUM":
        return <InformationCircleIcon className="h-6 w-6 text-yellow-600" />;
      case "LOW":
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      default:
        return null;
    }
  };

  const getRecommendationText = (risk) => {
    switch (risk?.toUpperCase()) {
      case "HIGH":
        return "Consider quality inspection before shipment and include prepaid return label";
      case "MEDIUM":
        return "Include clear product description and easy return instructions";
      case "LOW":
        return "Process normally - low return risk detected";
      default:
        return "Process according to standard procedures";
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <div
        className={`p-6 rounded-lg border-2 ${getRiskColor(
          riskLevel
        )}`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{getRiskIcon(riskLevel)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">
                Return Prediction Result
              </h3>
              <Badge variant="outline" className={getRiskColor(riskLevel)}>
                {riskLevel} RISK
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Return Probability</p>
                <div className="flex items-center gap-3">
                  <Progress value={probability} className="flex-1" />
                  <span className="text-2xl font-bold">{probability}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Confidence Score</p>
                <div className="flex items-center gap-3">
                  <Progress value={confidence} className="flex-1" />
                  <span className="text-2xl font-bold">{confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5 text-blue-600" />
          Recommended Actions
        </h4>
        <div className="space-y-2">
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-700">
              {getRecommendationText(riskLevel)}
            </p>
          )}
        </div>
      </div>

      {/* Contributing Factors */}
      {showFactors && factors && factors.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-4">Contributing Factors</h4>
          <div className="space-y-3">
            {factors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {factor.factor}
                  </p>
                  <p className="text-xs text-gray-500">{factor.value}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    factor.impact === "High"
                      ? "bg-red-50 text-red-700"
                      : factor.impact === "Medium"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-green-50 text-green-700"
                  }
                >
                  {factor.impact} Impact
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;
