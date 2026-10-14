import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./TeaLeavesGrading.css";


export default function TeaLeavesGrading() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState(null);

  const [prediction, setPrediction] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [reportLoading, setReportLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // Clean preview object URL
  // ==========================================================

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);


  // ==========================================================
  // Handle image selection
  // ==========================================================

  const handleFileChange = (event) => {
    const file =
      event.target.files[0];

    setError("");
    setPrediction(null);

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please upload a JPG, JPEG, or PNG tea leaf image."
      );

      setSelectedFile(null);
      setPreviewUrl(null);

      return;
    }

    setSelectedFile(file);

    setPreviewUrl(
      URL.createObjectURL(file)
    );
  };


  // ==========================================================
  // Send image to backend for prediction
  // ==========================================================

  const handlePrediction = async () => {
    if (!selectedFile) {
      setError(
        "Please select a tea leaf image first."
      );

      return;
    }

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response =
        await fetch(
          "http://127.0.0.1:8000/api/predict",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Tea leaf analysis failed."
        );
      }

      setPrediction(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to connect to the AI backend."
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // Download PDF report
  // ==========================================================

  const handleDownloadReport =
    async () => {
      if (!selectedFile) {
        setError(
          "Please select a tea leaf image first."
        );

        return;
      }

      setReportLoading(true);
      setError("");

      try {
        const formData =
          new FormData();

        formData.append(
          "file",
          selectedFile
        );

        const response =
          await fetch(
            "http://127.0.0.1:8000/api/download-report",
            {
              method: "POST",
              body: formData,
            }
          );

        if (!response.ok) {
          let message =
            "Unable to generate PDF report.";

          try {
            const data =
              await response.json();

            message =
              data.detail ||
              message;
          } catch {
            // Ignore JSON parsing error
          }

          throw new Error(
            message
          );
        }

        const blob =
          await response.blob();

        const downloadUrl =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          downloadUrl;

        link.download = `${
          selectedFile.name.split(
            "."
          )[0]
        }_grading_report.pdf`;

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        window.URL.revokeObjectURL(
          downloadUrl
        );
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to download the report."
        );
      } finally {
        setReportLoading(false);
      }
    };


  // ==========================================================
  // Clear selected image and result
  // ==========================================================

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError("");
  };


  // ==========================================================
  // Quality styles
  // ==========================================================

  const getQualityClass = () => {
    if (!prediction?.quality) {
      return "";
    }

    if (
      prediction.quality ===
      "Best"
    ) {
      return "quality-best";
    }

    if (
      prediction.quality ===
      "Below Best"
    ) {
      return "quality-medium";
    }

    return "quality-poor";
  };


  const getQualityIcon = () => {
    if (!prediction?.quality) {
      return "✓";
    }

    if (
      prediction.quality ===
      "Best"
    ) {
      return "✓";
    }

    if (
      prediction.quality ===
      "Below Best"
    ) {
      return "!";
    }

    return "×";
  };


  const getQualityDescription =
    () => {
      if (!prediction) {
        return "";
      }

      if (
        prediction.quality ===
        "Best"
      ) {
        return (
          "The analyzed leaf shows characteristics associated with the best quality group."
        );
      }

      if (
        prediction.quality ===
        "Below Best"
      ) {
        return (
          "The analyzed leaf shows acceptable characteristics but does not meet the best quality level."
        );
      }

      return (
        "The analyzed leaf shows characteristics associated with lower quality."
      );
    };


  // ==========================================================
  // Format values
  // ==========================================================

  const formatFeature = (
    value,
    decimals = 2
  ) => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(
        Number(value)
      )
    ) {
      return "N/A";
    }

    return Number(value).toFixed(
      decimals
    );
  };


  // ==========================================================
  // RGB chart data
  // ==========================================================

  const rgbChartData =
    useMemo(() => {
      if (
        !prediction?.features
      ) {
        return [];
      }

      return [
        {
          channel: "Red",
          value: Number(
            prediction.features
              .mean_red || 0
          ),
        },
        {
          channel: "Green",
          value: Number(
            prediction.features
              .mean_green || 0
          ),
        },
        {
          channel: "Blue",
          value: Number(
            prediction.features
              .mean_blue || 0
          ),
        },
      ];
    }, [prediction]);


  // ==========================================================
  // Full 21-feature table
  // ==========================================================

  const featureTableData =
    useMemo(() => {
      if (
        !prediction?.features
      ) {
        return [];
      }

      const features =
        prediction.features;

      return [
        {
          category: "Color",
          feature: "Mean Red",
          value: formatFeature(
            features.mean_red
          ),
          description:
            "Average red channel intensity",
        },
        {
          category: "Color",
          feature: "Mean Green",
          value: formatFeature(
            features.mean_green
          ),
          description:
            "Average green channel intensity",
        },
        {
          category: "Color",
          feature: "Mean Blue",
          value: formatFeature(
            features.mean_blue
          ),
          description:
            "Average blue channel intensity",
        },
        {
          category: "Color",
          feature: "Mean Hue",
          value: formatFeature(
            features.mean_hue
          ),
          description:
            "Average HSV hue value",
        },
        {
          category: "Color",
          feature:
            "Mean Saturation",
          value: formatFeature(
            features.mean_saturation
          ),
          description:
            "Average color saturation",
        },
        {
          category: "Color",
          feature: "Mean Value",
          value: formatFeature(
            features.mean_value
          ),
          description:
            "Average HSV brightness value",
        },
        {
          category: "Color",
          feature:
            "Red Standard Deviation",
          value: formatFeature(
            features.red_std
          ),
          description:
            "Variation of red intensity",
        },
        {
          category: "Color",
          feature:
            "Green Standard Deviation",
          value: formatFeature(
            features.green_std
          ),
          description:
            "Variation of green intensity",
        },
        {
          category: "Color",
          feature:
            "Blue Standard Deviation",
          value: formatFeature(
            features.blue_std
          ),
          description:
            "Variation of blue intensity",
        },

        {
          category: "Size",
          feature: "Area",
          value: formatFeature(
            features.area
          ),
          description:
            "Detected leaf region area",
        },
        {
          category: "Size",
          feature: "Perimeter",
          value: formatFeature(
            features.perimeter
          ),
          description:
            "Length of leaf boundary",
        },
        {
          category: "Size",
          feature: "Width",
          value: formatFeature(
            features.width,
            0
          ),
          description:
            "Detected leaf width in pixels",
        },
        {
          category: "Size",
          feature: "Height",
          value: formatFeature(
            features.height,
            0
          ),
          description:
            "Detected leaf height in pixels",
        },

        {
          category: "Shape",
          feature:
            "Aspect Ratio",
          value: formatFeature(
            features.aspect_ratio,
            3
          ),
          description:
            "Width-to-height relationship",
        },
        {
          category: "Shape",
          feature:
            "Circularity",
          value: formatFeature(
            features.circularity,
            3
          ),
          description:
            "Similarity of shape to a circle",
        },
        {
          category: "Shape",
          feature: "Solidity",
          value: formatFeature(
            features.solidity,
            3
          ),
          description:
            "Compactness of detected leaf shape",
        },
        {
          category: "Shape",
          feature: "Extent",
          value: formatFeature(
            features.extent,
            3
          ),
          description:
            "Leaf area relative to bounding box",
        },

        {
          category: "Texture",
          feature:
            "GLCM Contrast",
          value: formatFeature(
            features.glcm_contrast,
            4
          ),
          description:
            "Local intensity variation",
        },
        {
          category: "Texture",
          feature:
            "GLCM Homogeneity",
          value: formatFeature(
            features.glcm_homogeneity,
            4
          ),
          description:
            "Uniformity of leaf texture",
        },
        {
          category: "Texture",
          feature:
            "GLCM Energy",
          value: formatFeature(
            features.glcm_energy,
            4
          ),
          description:
            "Texture consistency measure",
        },
        {
          category: "Texture",
          feature:
            "GLCM Correlation",
          value: formatFeature(
            features.glcm_correlation,
            4
          ),
          description:
            "Relationship between neighboring pixels",
        },
      ];
    }, [prediction]);


  return (
    <div className="tea-grading-page">
      <div className="grading-container">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="grading-header">
          <div className="header-content">
            <div className="grading-badge">
              <span className="badge-dot" />

              AI-Powered Quality Analysis
            </div>

            <h1>
              Smart Tea Leaf
              <span>
                {" "}
                Quality Grading
              </span>
            </h1>

            <p>
              Upload a tea leaf image
              and automatically analyze
              its color, size, shape,
              and texture using
              YOLO11n-Seg and machine
              learning.
            </p>

            <div className="header-tech-row">
              <span>
                YOLO11n-Seg
              </span>

              <span>
                SVM Classification
              </span>

              <span>
                21 Features
              </span>
            </div>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/home")
            }
          >
            ← Back to Home
          </button>
        </header>


        {/* =====================================================
            PROCESS INDICATOR
        ====================================================== */}

        <div className="process-bar">
          <div className="process-step active">
            <div className="process-number">
              1
            </div>

            <div>
              <strong>
                Upload
              </strong>

              <span>
                Select leaf image
              </span>
            </div>
          </div>

          <div
            className={`process-line ${
              selectedFile
                ? "completed"
                : ""
            }`}
          />

          <div
            className={`process-step ${
              selectedFile
                ? "active"
                : ""
            }`}
          >
            <div className="process-number">
              2
            </div>

            <div>
              <strong>
                Analyze
              </strong>

              <span>
                AI feature extraction
              </span>
            </div>
          </div>

          <div
            className={`process-line ${
              prediction
                ? "completed"
                : ""
            }`}
          />

          <div
            className={`process-step ${
              prediction
                ? "active"
                : ""
            }`}
          >
            <div className="process-number">
              3
            </div>

            <div>
              <strong>
                Result
              </strong>

              <span>
                Quality classification
              </span>
            </div>
          </div>
        </div>


        {/* =====================================================
            MAIN GRID
        ====================================================== */}

        <div className="grading-grid">

          {/* UPLOAD */}

          <section className="grading-card upload-card">
            <div className="card-heading">
              <div>
                <span className="step-label">
                  Step 01
                </span>

                <h2>
                  Upload Tea Leaf
                </h2>

                <p className="card-description">
                  Use a clear image
                  with the entire tea
                  leaf visible.
                </p>
              </div>
            </div>

            <label
              className={`upload-area ${
                previewUrl
                  ? "has-image"
                  : ""
              }`}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={
                  handleFileChange
                }
              />

              {!previewUrl ? (
                <div className="upload-placeholder">
                  <div className="upload-icon">
                    ↑
                  </div>

                  <h3>
                    Upload Tea Leaf Image
                  </h3>

                  <p>
                    Drag and drop or
                    click to browse your
                    computer
                  </p>

                  <span>
                    JPG, JPEG, PNG
                  </span>

                  <div className="upload-help">
                    Recommended: clear
                    background and good
                    lighting
                  </div>
                </div>
              ) : (
                <div className="image-preview-wrapper">
                  <img
                    src={previewUrl}
                    alt="Tea leaf preview"
                    className="tea-preview"
                  />

                  <div className="image-overlay">
                    Change Image
                  </div>

                  <div className="image-ready-badge">
                    ✓ Image Ready
                  </div>
                </div>
              )}
            </label>

            {selectedFile && (
              <div className="selected-file">
                <div className="file-icon">
                  IMG
                </div>

                <div className="file-details">
                  <span>
                    Selected Image
                  </span>

                  <strong>
                    {
                      selectedFile.name
                    }
                  </strong>

                  <small>
                    {(
                      selectedFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </small>
                </div>

                <span className="file-ready">
                  Ready
                </span>
              </div>
            )}

            <div className="upload-actions">
              <button
                type="button"
                className="analyze-button"
                onClick={
                  handlePrediction
                }
                disabled={
                  loading ||
                  !selectedFile
                }
              >
                {loading ? (
                  <>
                    <span className="spinner" />

                    Analyzing Leaf...
                  </>
                ) : (
                  <>
                    <span>
                      ✦
                    </span>

                    Analyze Tea Leaf
                  </>
                )}
              </button>

              {selectedFile && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    handleClear
                  }
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>

            {loading && (
              <div className="analysis-status">
                <span className="status-dot" />

                <div>
                  <strong>
                    AI analysis in
                    progress
                  </strong>

                  <p>
                    Detecting leaf,
                    extracting features
                    and predicting
                    quality...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <div className="error-icon">
                  !
                </div>

                <div>
                  <strong>
                    Analysis Error
                  </strong>

                  <span>
                    {error}
                  </span>
                </div>
              </div>
            )}
          </section>


          {/* RESULT */}

          <section className="grading-card result-card">
            <div className="card-heading">
              <div>
                <span className="step-label">
                  Step 02
                </span>

                <h2>
                  Quality Result
                </h2>

                <p className="card-description">
                  AI-generated
                  classification and
                  confidence score.
                </p>
              </div>
            </div>

            {!prediction ? (
              <div className="empty-result">
                <div className="empty-result-icon">
                  ✦
                </div>

                <h3>
                  Waiting for Analysis
                </h3>

                <p>
                  Upload a tea leaf
                  image and click
                  Analyze Tea Leaf to
                  generate the grading
                  result.
                </p>
              </div>
            ) : (
              <div className="result-content">
                <div
                  className={`quality-result ${getQualityClass()}`}
                >
                  <div className="quality-icon">
                    {getQualityIcon()}
                  </div>

                  <span className="quality-label">
                    Predicted Quality
                  </span>

                  <h3>
                    {
                      prediction.quality
                    }
                  </h3>

                  <div className="grade-pill">
                    {
                      prediction.prediction
                    }
                  </div>

                  <p className="quality-description">
                    {
                      getQualityDescription()
                    }
                  </p>
                </div>

                <div className="confidence-section">
                  <div className="confidence-heading">
                    <div>
                      <span>
                        Model Confidence
                      </span>

                      <small>
                        Prediction
                        certainty
                      </small>
                    </div>

                    <strong>
                      {prediction.confidence !==
                        null &&
                      prediction.confidence !==
                        undefined
                        ? `${Number(
                            prediction.confidence
                          ).toFixed(
                            2
                          )}%`
                        : "N/A"}
                    </strong>
                  </div>

                  <div className="confidence-track">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${Math.min(
                          prediction.confidence ||
                            0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="model-info">
                  <div>
                    <span>
                      Classifier
                    </span>

                    <strong>
                      {prediction.classification_model ||
                        "SVM"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Segmentation
                    </span>

                    <strong>
                      {prediction.segmentation_model ||
                        "YOLO11n-Seg"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Feature Count
                    </span>

                    <strong>
                      {prediction.feature_count ||
                        21}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Classes
                    </span>

                    <strong>
                      A / B / C
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="report-button"
                  onClick={
                    handleDownloadReport
                  }
                  disabled={
                    reportLoading
                  }
                >
                  {reportLoading ? (
                    <>
                      <span className="spinner" />

                      Generating
                      Report...
                    </>
                  ) : (
                    <>
                      ↓ Download PDF
                      Report
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        </div>


        {/* =====================================================
            FEATURE CARDS
        ====================================================== */}

        {prediction?.features && (
          <>
            <section className="features-section">
              <div className="features-header">
                <div>
                  <span className="step-label">
                    Step 03
                  </span>

                  <h2>
                    Detailed Leaf
                    Analysis
                  </h2>

                  <p>
                    21 extracted
                    measurements used by
                    the machine learning
                    model.
                  </p>
                </div>

                <div className="feature-summary-badge">
                  21 Features Extracted
                </div>
              </div>

              <div className="feature-grid">

                {/* COLOR */}

                <div className="feature-card">
                  <div className="feature-card-header">
                    <div className="feature-icon color-icon">
                      C
                    </div>

                    <div>
                      <h3>
                        Color Analysis
                      </h3>

                      <p>
                        RGB and HSV
                        characteristics
                      </p>
                    </div>
                  </div>

                  <FeatureRow
                    label="Mean Red"
                    value={formatFeature(
                      prediction.features
                        .mean_red
                    )}
                  />

                  <FeatureRow
                    label="Mean Green"
                    value={formatFeature(
                      prediction.features
                        .mean_green
                    )}
                  />

                  <FeatureRow
                    label="Mean Blue"
                    value={formatFeature(
                      prediction.features
                        .mean_blue
                    )}
                  />

                  <FeatureRow
                    label="Mean Hue"
                    value={formatFeature(
                      prediction.features
                        .mean_hue
                    )}
                  />

                  <FeatureRow
                    label="Mean Saturation"
                    value={formatFeature(
                      prediction.features
                        .mean_saturation
                    )}
                  />

                  <FeatureRow
                    label="Mean Value"
                    value={formatFeature(
                      prediction.features
                        .mean_value
                    )}
                  />

                  <FeatureRow
                    label="Red Std."
                    value={formatFeature(
                      prediction.features
                        .red_std
                    )}
                  />

                  <FeatureRow
                    label="Green Std."
                    value={formatFeature(
                      prediction.features
                        .green_std
                    )}
                  />

                  <FeatureRow
                    label="Blue Std."
                    value={formatFeature(
                      prediction.features
                        .blue_std
                    )}
                  />
                </div>


                {/* SIZE */}

                <div className="feature-card">
                  <div className="feature-card-header">
                    <div className="feature-icon size-icon">
                      Z
                    </div>

                    <div>
                      <h3>
                        Size Analysis
                      </h3>

                      <p>
                        Leaf dimension
                        measurements
                      </p>
                    </div>
                  </div>

                  <FeatureRow
                    label="Area"
                    value={formatFeature(
                      prediction.features
                        .area
                    )}
                  />

                  <FeatureRow
                    label="Perimeter"
                    value={formatFeature(
                      prediction.features
                        .perimeter
                    )}
                  />

                  <FeatureRow
                    label="Width"
                    value={formatFeature(
                      prediction.features
                        .width,
                      0
                    )}
                  />

                  <FeatureRow
                    label="Height"
                    value={formatFeature(
                      prediction.features
                        .height,
                      0
                    )}
                  />
                </div>


                {/* SHAPE */}

                <div className="feature-card">
                  <div className="feature-card-header">
                    <div className="feature-icon shape-icon">
                      S
                    </div>

                    <div>
                      <h3>
                        Shape Analysis
                      </h3>

                      <p>
                        Geometrical
                        characteristics
                      </p>
                    </div>
                  </div>

                  <FeatureRow
                    label="Aspect Ratio"
                    value={formatFeature(
                      prediction.features
                        .aspect_ratio,
                      3
                    )}
                  />

                  <FeatureRow
                    label="Circularity"
                    value={formatFeature(
                      prediction.features
                        .circularity,
                      3
                    )}
                  />

                  <FeatureRow
                    label="Solidity"
                    value={formatFeature(
                      prediction.features
                        .solidity,
                      3
                    )}
                  />

                  <FeatureRow
                    label="Extent"
                    value={formatFeature(
                      prediction.features
                        .extent,
                      3
                    )}
                  />
                </div>


                {/* TEXTURE */}

                <div className="feature-card">
                  <div className="feature-card-header">
                    <div className="feature-icon texture-icon">
                      T
                    </div>

                    <div>
                      <h3>
                        Texture Analysis
                      </h3>

                      <p>
                        GLCM surface
                        characteristics
                      </p>
                    </div>
                  </div>

                  <FeatureRow
                    label="GLCM Contrast"
                    value={formatFeature(
                      prediction.features
                        .glcm_contrast,
                      4
                    )}
                  />

                  <FeatureRow
                    label="GLCM Homogeneity"
                    value={formatFeature(
                      prediction.features
                        .glcm_homogeneity,
                      4
                    )}
                  />

                  <FeatureRow
                    label="GLCM Energy"
                    value={formatFeature(
                      prediction.features
                        .glcm_energy,
                      4
                    )}
                  />

                  <FeatureRow
                    label="GLCM Correlation"
                    value={formatFeature(
                      prediction.features
                        .glcm_correlation,
                      4
                    )}
                  />
                </div>
              </div>
            </section>


            {/* =================================================
                CHART
            ================================================== */}

            <section className="analysis-chart-section">
              <div className="analytics-section-header">
                <div>
                  <span className="step-label">
                    Step 04
                  </span>

                  <h2>
                    Leaf Color Profile
                  </h2>

                  <p>
                    Comparison of the
                    average Red, Green,
                    and Blue channel
                    intensities extracted
                    from the detected tea
                    leaf.
                  </p>
                </div>

                <div className="chart-info-badge">
                  RGB Analysis
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-card-heading">
                  <div>
                    <h3>
                      Mean RGB Intensity
                    </h3>

                    <p>
                      Higher bars
                      represent stronger
                      average channel
                      intensity.
                    </p>
                  </div>

                  <span className="chart-scale-badge">
                    Pixel Intensity
                  </span>
                </div>

                <div className="chart-wrapper">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={
                        rgbChartData
                      }
                      margin={{
                        top: 15,
                        right: 20,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="channel"
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        domain={[
                          0,
                          255,
                        ]}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip
                        formatter={(
                          value
                        ) => [
                          Number(
                            value
                          ).toFixed(
                            2
                          ),
                          "Mean Intensity",
                        ]}
                      />

                      <Bar
                        dataKey="value"
                        name="Mean Intensity"
                        fill="#2a9d57"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                        maxBarSize={
                          95
                        }
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-summary-grid">
                  <div>
                    <span>
                      Mean Red
                    </span>

                    <strong>
                      {formatFeature(
                        prediction
                          .features
                          .mean_red
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Mean Green
                    </span>

                    <strong>
                      {formatFeature(
                        prediction
                          .features
                          .mean_green
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Mean Blue
                    </span>

                    <strong>
                      {formatFeature(
                        prediction
                          .features
                          .mean_blue
                      )}
                    </strong>
                  </div>
                </div>

                <p className="chart-note">
                  RGB values are shown
                  together because they
                  use the same intensity
                  scale. Other feature
                  groups use different
                  measurement scales and
                  are listed separately
                  in the detailed table.
                </p>
              </div>
            </section>


            {/* =================================================
                TABLE
            ================================================== */}

            <section className="feature-table-section">
              <div className="analytics-section-header">
                <div>
                  <span className="step-label">
                    Step 05
                  </span>

                  <h2>
                    Complete Feature
                    Data Table
                  </h2>

                  <p>
                    All 21 feature values
                    extracted from the
                    current tea leaf
                    image.
                  </p>
                </div>

                <div className="table-count-badge">
                  {
                    featureTableData.length
                  }{" "}
                  Measurements
                </div>
              </div>

              <div className="feature-table-card">
                <div className="table-scroll">
                  <table className="feature-data-table">
                    <thead>
                      <tr>
                        <th>
                          No.
                        </th>

                        <th>
                          Category
                        </th>

                        <th>
                          Feature
                        </th>

                        <th>
                          Extracted
                          Value
                        </th>

                        <th>
                          Description
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {featureTableData.map(
                        (
                          row,
                          index
                        ) => (
                          <tr
                            key={`${row.category}-${row.feature}`}
                          >
                            <td className="table-index">
                              {String(
                                index +
                                  1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </td>

                            <td>
                              <span
                                className={`category-pill category-${row.category.toLowerCase()}`}
                              >
                                {
                                  row.category
                                }
                              </span>
                            </td>

                            <td className="feature-name-cell">
                              {
                                row.feature
                              }
                            </td>

                            <td className="feature-value-cell">
                              {
                                row.value
                              }
                            </td>

                            <td className="feature-description-cell">
                              {
                                row.description
                              }
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="table-footer-info">
                  <div>
                    <span>
                      Total Features
                    </span>

                    <strong>
                      21
                    </strong>
                  </div>

                  <div>
                    <span>
                      Color
                    </span>

                    <strong>
                      9
                    </strong>
                  </div>

                  <div>
                    <span>
                      Size
                    </span>

                    <strong>
                      4
                    </strong>
                  </div>

                  <div>
                    <span>
                      Shape
                    </span>

                    <strong>
                      4
                    </strong>
                  </div>

                  <div>
                    <span>
                      Texture
                    </span>

                    <strong>
                      4
                    </strong>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}


function FeatureRow({
  label,
  value,
}) {
  return (
    <div className="feature-row">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}