import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Leaf,
  LayoutDashboard,
  LogOut,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import plantationImage from "../../assets/tea images/tea-bg.webp";
import teaPackageImage from "../../assets/tea images/teapack-about.jpg";

import "./HomePage.css";


const CURRENT_USER_STORAGE_KEY =
  "teaFactoryCurrentUser";


function getCurrentUser() {
  try {
    const savedUser = sessionStorage.getItem(
      CURRENT_USER_STORAGE_KEY
    );

    if (!savedUser) {
      return null;
    }

    return JSON.parse(savedUser);
  } catch (error) {
    console.error(
      "Could not read the current user:",
      error
    );

    return null;
  }
}


export default function HomePage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const userName =
    currentUser?.fullName
      ? currentUser.fullName.split(" ")[0]
      : "User";


  const modules = [
    {
      title: "Tea Quantity Prediction",

      category: "Production Intelligence",

      description:
        "Predict total tea production using year, month, temperature, rainfall, humidity, soil pH, and elevation.",

      icon: <BarChart3 size={25} />,

      path: "/tea-quantity-prediction",

      image: plantationImage,

      imageAlt:
        "Tea plantation used for quantity prediction",

      className: "quantity-module",
    },

    {
      title: "Tea Demand Forecasting",

      category: "Market Planning",

      description:
        "Forecast future tea demand to support production planning, inventory control, and factory scheduling.",

      icon: <TrendingUp size={25} />,

      path: "/tea-demand-forecasting",

      image: teaPackageImage,

      imageAlt:
        "Packaged tea used for demand forecasting",

      className: "demand-module",
    },

    {
      title: "Tea Leaves Grading & Quality",

      category: "Quality Control",

      description:
        "Analyze tea leaf images and classify their quality using machine-learning technology.",

      icon: <Leaf size={25} />,

      path: "/tea-leaves-grading",

      image: "/images/images.jpg",

      imageAlt:
        "Fresh tea leaves used for quality grading",

      className: "grading-module",
    },
  ];


  const handleLogout = () => {
    sessionStorage.removeItem(
      CURRENT_USER_STORAGE_KEY
    );

    navigate(
      "/login",
      {
        replace: true
      }
    );
  };


  return (
    <div
      className="home-page"
      style={{
        "--home-background-image":
          `url(${plantationImage})`,
      }}
    >
      <header className="topbar">
        <div className="topbar-inner">
          <button
            type="button"
            className="brand-button"
            onClick={() => navigate("/home")}
            aria-label="Open dashboard home"
          >
            <span className="brand-icon">
              <Leaf
                size={24}
                strokeWidth={2.2}
              />
            </span>

            <span className="brand-content">
              <span className="brand-name">
                Tea Factory
              </span>

              <span className="brand-description">
                Management System
              </span>
            </span>
          </button>


          <div className="topbar-actions">
            <div className="user-welcome">
              <span className="user-status-dot" />

              <div>
                <small>
                  Welcome back
                </small>

                <strong>
                  {userName}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut
                size={17}
                aria-hidden="true"
              />

              Logout
            </button>
          </div>
        </div>
      </header>


      <main className="home-content">
        <section className="dashboard-hero">
          <div className="hero-overlay" />

          <div className="hero-content">
            <p className="hero-label">
              <Sparkles
                size={15}
                aria-hidden="true"
              />

               Tea Factory Operations
            </p>

            <h1>
              Make smarter decisions for every
              stage of tea production.
            </h1>

            <p className="hero-description">
              Use machine-learning tools to estimate production,
              forecast market demand, and maintain consistent tea
              leaf quality from one unified dashboard.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="hero-primary-button"
                onClick={() =>
                  navigate(
                    "/tea-quantity-prediction"
                  )
                }
              >
                Start Prediction

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </button>

              <div className="hero-module-count">
                <strong>3</strong>

                <span>
                  Machine Learning
                  <br />
                  modules
                </span>
              </div>
            </div>
          </div>


          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                src="/images/images.jpg"
                alt="Beautiful green tea plantation"
                className="hero-image"
              />

              <div className="hero-image-gradient" />
            </div>

            <div className="hero-floating-card">
              <div className="floating-card-icon">
                <LayoutDashboard size={21} />
              </div>

              <div>
                <small>
                  Unified Platform
                </small>

                <strong>
                  Tea Intelligence
                </strong>
              </div>
            </div>

            <div className="hero-leaf-badge">
              <Leaf size={20} />

              <span>
                ML Powered
              </span>
            </div>
          </div>
        </section>


        <section className="modules-section">
          <div className="modules-heading">
            <div>
              <p className="section-label">
                Factory Intelligence
              </p>

              <h2>
                Explore the management modules
              </h2>

              <p>
                Select a module to begin analyzing tea
                production, demand, or quality.
              </p>
            </div>

            <div className="section-decoration">
              <Leaf size={22} />
            </div>
          </div>


          <div className="module-grid">
            {modules.map((module) => (
              <article
                key={module.title}
                className={
                  `module-card ${module.className}`
                }
              >
                <div className="module-image-container">
                  <img
                    src={module.image}
                    alt={module.imageAlt}
                    className="module-image"
                  />

                  <div className="module-image-overlay" />

                  <div className="module-icon">
                    {module.icon}
                  </div>

                  <span className="module-category">
                    {module.category}
                  </span>
                </div>


                <div className="module-card-content">
                  <h3>
                    {module.title}
                  </h3>

                  <p>
                    {module.description}
                  </p>

                  <button
                    type="button"
                    className="module-open-button"
                    onClick={() =>
                      navigate(module.path)
                    }
                  >
                    Open Module

                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>


        <footer className="dashboard-footer">
          <div className="footer-brand">
            <Leaf size={19} />

            <span>
              Tea Factory Management System
            </span>
          </div>

          <p>
            Machine-learning decision support for tea
            production, demand, and quality management.
          </p>
        </footer>
      </main>
    </div>
  );
}