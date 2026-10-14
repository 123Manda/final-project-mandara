import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import SignInPage from "./pages/auth/SignInPage";

import HomePage from "./pages/dashboard/HomePage";

import TeaQuantityPrediction from "./pages/quantity/TeaQuantityPrediction";

import TeaDemandForecasting from "./pages/demand/TeaDemandForecasting";
import DemandHome from "./pages/demand/DemandHome";
import WeeklyDataEntry from "./pages/demand/WeeklyDataEntry";
import DemandForecast from "./pages/demand/DemandForecast";
import DemandAlerts from "./pages/demand/DemandAlerts";
import DemandExplainability from "./pages/demand/DemandExplainability";
import DemandHistory from "./pages/demand/DemandHistory";
import DemandReports from "./pages/demand/DemandReports";

import TeaLeavesGrading from "./pages/grading/TeaLeavesGrading";


function App() {
  return (
    <Router>

      <Routes>

        {/* =====================================================
            DEFAULT ROUTE
        ===================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =====================================================
            AUTHENTICATION
        ===================================================== */}

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/signin"
          element={
            <SignInPage />
          }
        />


        {/* =====================================================
            MAIN DASHBOARD
        ===================================================== */}

        <Route
          path="/home"
          element={
            <HomePage />
          }
        />


        {/* =====================================================
            TEA QUANTITY PREDICTION
        ===================================================== */}

        <Route
          path="/tea-quantity-prediction"
          element={
            <TeaQuantityPrediction />
          }
        />


        {/* =====================================================
            TEA DEMAND FORECASTING
        ===================================================== */}

        <Route
          path="/tea-demand-forecasting"
          element={
            <TeaDemandForecasting />
          }
        >

          {/* Demand Forecasting Home */}
          <Route
            index
            element={
              <DemandHome />
            }
          />


          {/* Weekly Data Entry */}
          <Route
            path="weekly-data"
            element={
              <WeeklyDataEntry />
            }
          />


          {/* Demand Forecast */}
          <Route
            path="forecast"
            element={
              <DemandForecast />
            }
          />


          {/* Alerts & Recommendations */}
          <Route
            path="alerts"
            element={
              <DemandAlerts />
            }
          />


          {/* Explainability */}
          <Route
            path="explainability"
            element={
              <DemandExplainability />
            }
          />


          {/* Forecast History */}
          <Route
            path="history"
            element={
              <DemandHistory />
            }
          />


          {/* Reports */}
          <Route
            path="reports"
            element={
              <DemandReports />
            }
          />

        </Route>


        {/* =====================================================
            TEA LEAF GRADING
        ===================================================== */}

        <Route
          path="/tea-leaves-grading"
          element={
            <TeaLeavesGrading />
          }
        />


        {/* =====================================================
            UNKNOWN ROUTES
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />

      </Routes>

    </Router>
  );
}


export default App;