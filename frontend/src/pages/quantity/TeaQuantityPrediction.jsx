import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  FileDown,
  Leaf,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import "./TeaQuantityPrediction.css";


const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


// Minimum year allowed for prediction
const MIN_PREDICTION_YEAR = 2030;


const performanceMetrics = [
  {
    id: "r2",
    label: "R² Score",
    value: "0.1359",
    width: 13.59,
    scale: "Scale: 0 to 1",
    direction: "Higher is better",
    description:
      "The model explains approximately 13.59% of the variation in the test data.",
  },
  {
    id: "mae",
    label: "Mean Absolute Error",
    shortLabel: "MAE",
    value: "7,763,337.40 kg",
    width: 77.63,
    scale: "Scale: 0 to 10M kg",
    direction: "Lower is better",
    description:
      "The average difference between the actual and predicted production quantities.",
  },
  {
    id: "rmse",
    label: "Root Mean Squared Error",
    shortLabel: "RMSE",
    value: "8,775,717.99 kg",
    width: 87.76,
    scale: "Scale: 0 to 10M kg",
    direction: "Lower is better",
    description:
      "Measures prediction error while giving more importance to larger errors.",
  },
];


const emptyForm = {
  year: "",
  month: "",
  temp_avg: "",
  rain: "",
  humidity: "",
  approx_ph: "",
  elevation: "",
};


export default function TeaQuantityPrediction() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [prediction, setPrediction] = useState(null);
  const [modelName, setModelName] = useState("");
  const [generatedAt, setGeneratedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ==========================================================
  // Handle input changes
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setPrediction(null);
    setModelName("");
    setGeneratedAt("");
    setError("");
  };


  // ==========================================================
  // Send input data to the backend
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setPrediction(null);

    const requestData = {
      year: Number(formData.year),
      month: Number(formData.month),
      temp_avg: Number(formData.temp_avg),
      rain: Number(formData.rain),
      humidity: Number(formData.humidity),
      approx_ph: Number(formData.approx_ph),
      elevation: formData.elevation,
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8002/api/predict",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = "Prediction failed.";

        if (typeof result.detail === "string") {
          errorMessage = result.detail;
        } else if (Array.isArray(result.detail)) {
          errorMessage = result.detail
            .map((item) => item.msg)
            .join(", ");
        }

        throw new Error(errorMessage);
      }

      setPrediction(result.predicted_production_kg);
      setModelName(result.model);
      setGeneratedAt(new Date().toLocaleString());
    } catch (requestError) {
      setError(
        requestError.message ||
        "Could not connect to the prediction backend."
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // Clear form
  // ==========================================================

  const handleReset = () => {
    setFormData(emptyForm);
    setPrediction(null);
    setModelName("");
    setGeneratedAt("");
    setError("");
  };


  // ==========================================================
  // Generate printable report
  // ==========================================================

  const handleGenerateReport = () => {
    if (prediction !== null) {
      window.print();
    }
  };


  const selectedMonth =
    formData.month !== ""
      ? monthNames[Number(formData.month) - 1]
      : "";


  return (
    <div className="quantity-prediction-page">
      <main className="quantity-container">
        <header className="quantity-header">
          <div className="quantity-header-content">
            <div
              className="quantity-brand-mark"
              aria-hidden="true"
            >
              <Leaf
                size={26}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <p className="quantity-label">
                <Sparkles
                  size={14}
                  aria-hidden="true"
                />

                ML-Powered Tea Production Analysis
              </p>

              <h1>Tea Quantity Prediction</h1>

              <p className="quantity-subtitle">
                Enter the production conditions below to estimate
                the total tea production quantity with your trained
                Extra Trees model.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="secondary-btn header-back-btn"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            Back to Home
          </button>
        </header>


        <section className="prediction-content">
          <form
            className="prediction-form"
            onSubmit={handleSubmit}
          >
            <div className="section-title-row">
              <div
                className="section-icon"
                aria-hidden="true"
              >
                <Leaf size={20} />
              </div>

              <div>
                <h2>Production Information</h2>

                <p>
                  Complete all seven fields before making a
                  prediction.
                </p>
              </div>
            </div>


            <div className="prediction-form-grid">
              <div className="form-group">
                <label htmlFor="year">
                  Year
                </label>

                <input
                  id="year"
                  name="year"
                  type="number"
                  min={MIN_PREDICTION_YEAR}
                  max="2100"
                  step="1"
                  placeholder="Example: 2030"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group">
                <label htmlFor="month">
                  Month
                </label>

                <select
                  id="month"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select month
                  </option>

                  {monthNames.map((month, index) => (
                    <option
                      key={month}
                      value={index + 1}
                    >
                      {month}
                    </option>
                  ))}
                </select>
              </div>


              <div className="form-group">
                <label htmlFor="temp_avg">
                  Average Temperature (°C)
                </label>

                <input
                  id="temp_avg"
                  name="temp_avg"
                  type="number"
                  step="0.01"
                  placeholder="Example: 25.5"
                  value={formData.temp_avg}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group">
                <label htmlFor="rain">
                  Rainfall (mm)
                </label>

                <input
                  id="rain"
                  name="rain"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Example: 150"
                  value={formData.rain}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group">
                <label htmlFor="humidity">
                  Humidity (%)
                </label>

                <input
                  id="humidity"
                  name="humidity"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Example: 82"
                  value={formData.humidity}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group">
                <label htmlFor="approx_ph">
                  Approximate Soil pH
                </label>

                <input
                  id="approx_ph"
                  name="approx_ph"
                  type="number"
                  min="0.1"
                  max="14"
                  step="0.01"
                  placeholder="Example: 4.8"
                  value={formData.approx_ph}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group elevation-field">
                <label htmlFor="elevation">
                  Elevation
                </label>

                <select
                  id="elevation"
                  name="elevation"
                  value={formData.elevation}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select elevation
                  </option>

                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>
                </select>
              </div>
            </div>


            <div className="prediction-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                <Sparkles
                  size={18}
                  aria-hidden="true"
                />

                {loading
                  ? "Predicting..."
                  : "Predict Production"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={handleReset}
                disabled={loading}
              >
                <RotateCcw
                  size={17}
                  aria-hidden="true"
                />

                Clear
              </button>
            </div>
          </form>


          <section
            className="prediction-result"
            aria-live="polite"
          >
            <div className="section-title-row result-title-row">
              <div
                className="section-icon"
                aria-hidden="true"
              >
                <BarChart3 size={20} />
              </div>

              <div>
                <h2>Prediction Result</h2>

                <p>
                  Your estimated production will appear here.
                </p>
              </div>
            </div>


            {prediction === null && !error && (
              <div className="empty-result">
                <div
                  className="empty-result-icon"
                  aria-hidden="true"
                >
                  <Leaf size={28} />
                </div>

                <p>
                  Complete the form and select Predict Production
                  to display the result.
                </p>
              </div>
            )}


            {prediction !== null && (
              <div className="result-success">
                <header className="print-report-header">
                  <p>
                    Tea Factory Management System
                  </p>

                  <h2>
                    Tea Quantity Prediction Report
                  </h2>

                  <span>
                    Generated: {generatedAt}
                  </span>
                </header>


                <div
                  className="success-icon"
                  aria-hidden="true"
                >
                  <Leaf size={25} />
                </div>


                <p className="result-label">
                  Predicted Total Production
                </p>


                <h3 className="predicted-value">
                  {prediction.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}{" "}

                  <small>kg</small>
                </h3>


                <div className="report-details">
                  <div className="report-detail">
                    <span>Year</span>
                    <strong>{formData.year}</strong>
                  </div>

                  <div className="report-detail">
                    <span>Month</span>
                    <strong>{selectedMonth}</strong>
                  </div>

                  <div className="report-detail">
                    <span>Temperature</span>

                    <strong>
                      {formData.temp_avg} °C
                    </strong>
                  </div>

                  <div className="report-detail">
                    <span>Rainfall</span>

                    <strong>
                      {formData.rain} mm
                    </strong>
                  </div>

                  <div className="report-detail">
                    <span>Humidity</span>

                    <strong>
                      {formData.humidity}%
                    </strong>
                  </div>

                  <div className="report-detail">
                    <span>Soil pH</span>

                    <strong>
                      {formData.approx_ph}
                    </strong>
                  </div>

                  <div className="report-detail full-detail">
                    <span>Elevation</span>

                    <strong className="capitalize">
                      {formData.elevation}
                    </strong>
                  </div>
                </div>


                <span className="model-badge">
                  Model: {modelName}
                </span>


                <button
                  type="button"
                  className="generate-report-btn no-print"
                  onClick={handleGenerateReport}
                >
                  <FileDown
                    size={18}
                    aria-hidden="true"
                  />

                  Generate Report
                </button>


                <p className="report-instruction no-print">
                  Select “Save as PDF” in the print window.
                </p>


                <footer className="print-report-footer">
                  <p>
                    Generated using the {modelName}
                    machine-learning model.
                  </p>
                </footer>
              </div>
            )}


            {error && (
              <div className="result-error">
                <h3>
                  Prediction unsuccessful
                </h3>

                <p>{error}</p>
              </div>
            )}
          </section>
        </section>


        <section className="metrics-section">
          <div className="metrics-heading">
            <div>
              <p className="metrics-label">
                Model Evaluation
              </p>

              <h2>
                Extra Trees Performance Metrics
              </h2>

              <p>
                Results obtained by evaluating the trained
                model on the testing dataset.
              </p>
            </div>

            <span className="model-status">
              <Sparkles
                size={14}
                aria-hidden="true"
              />

              Selected Model
            </span>
          </div>


          <div className="metrics-grid">
            {performanceMetrics.map((metric) => (
              <article
                className={`metric-card ${metric.id}-metric`}
                key={metric.id}
              >
                <div className="metric-top">
                  <div>
                    <span className="metric-short-name">
                      {metric.shortLabel || metric.label}
                    </span>

                    <h3>{metric.label}</h3>
                  </div>

                  <span className="metric-direction">
                    {metric.direction}
                  </span>
                </div>


                <strong className="metric-value">
                  {metric.value}
                </strong>


                <div
                  className="metric-bar-track"
                  role="img"
                  aria-label={
                    `${metric.label}: ${metric.value}`
                  }
                >
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: `${metric.width}%`,
                    }}
                  />
                </div>


                <div className="metric-scale">
                  <span>0</span>
                  <span>{metric.scale}</span>
                </div>


                <p className="metric-description">
                  {metric.description}
                </p>
              </article>
            ))}
          </div>


          <p className="metrics-warning">
            R² is not an accuracy percentage. A higher R² is
            better, while lower MAE and RMSE values are better.
          </p>
        </section>
      </main>
    </div>
  );
}