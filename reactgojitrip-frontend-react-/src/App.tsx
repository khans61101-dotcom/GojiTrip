import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import RootLayout from "@/app/layout";
import PublicLayout from "@/app/(public)/layout";
import AuthLayout from "@/app/auth/layout";
import DashboardLayout from "@/app/(dashboard)/layout";

// ============================================================
// PUBLIC / USER-FACING PAGES
// ============================================================

import HomePage from "@/app/(public)/page";

import FamousPlacesPage from "@/app/pages/famous-places/page";
import FamousPlaceDetailPage from "@/app/pages/famous-places/detail/page";
import FuelStationPage from "@/app/pages/fuel-station/page";
import PublicGuidePage from "@/app/pages/guide/page";
import PublicHotelsPage from "@/app/pages/hotels/page";
import PublicRestaurantsPage from "@/app/pages/restaurants/page";
import PublicRoutePage from "@/app/pages/route/page";
import PublicTransportPage from "@/app/pages/transport/page";
import PublicAboutPage from "@/app/pages/about/page";

// ============================================================
// AUTH PAGES
// ============================================================

import LoginPage from "@/app/auth/login/page";
import RegisterPage from "@/app/auth/register/page";

// ============================================================
// ADMIN / DASHBOARD PAGES
// ============================================================

import DashboardPage from "@/app/(dashboard)/dashboard/page";
import RoutesPage from "@/app/(dashboard)/routes/page";
import HotelsPage from "@/app/(dashboard)/hotels/page";
import HomestaysPage from "@/app/(dashboard)/homestays/page";
import RestaurantsPage from "@/app/(dashboard)/restaurants/page";
import ActivitiesPage from "@/app/(dashboard)/activities/page";
import GuidesPage from "@/app/(dashboard)/guides/page";
import AdminFamousPlacesPage from "@/app/(dashboard)/famous-places/page";
import AdminFuelStationsPage from "@/app/(dashboard)/fuel-stations/page";
import MediaLibraryPage from "@/app/(dashboard)/media/page";
import TransportPage from "@/app/(dashboard)/transport/page";
import WorkflowPage from "@/app/(dashboard)/workflow/page";

// ============================================================
// APP
// ============================================================

export function App() {
  return (
    <RootLayout>
      <Routes>
        {/* ======================================================
            PUBLIC LANDING PAGE
            ====================================================== */}

        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />

        <Route
          path="/about"
          element={
            <PublicLayout>
              <PublicAboutPage />
            </PublicLayout>
          }
        />

        <Route
          path="/pages/about"
          element={
            <PublicLayout>
              <PublicAboutPage />
            </PublicLayout>
          }
        />

        {/* ======================================================
            PUBLIC / USER-FACING ROUTES

            IMPORTANT:
            These routes MUST render public pages,
            NOT dashboard/admin management pages.
            ====================================================== */}

        <Route
          path="/pages/hotels"
          element={
            <PublicLayout>
              <PublicHotelsPage />
            </PublicLayout>
          }
        />

        <Route
          path="/pages/restaurants"
          element={
            <PublicLayout>
              <PublicRestaurantsPage />
            </PublicLayout>
          }
        />

        <Route
          path="/pages/transport"
          element={
            <PublicLayout>
              <PublicTransportPage />
            </PublicLayout>
          }
        />

        <Route
          path="/pages/routes"
          element={
            <PublicLayout>
              <PublicRoutePage />
            </PublicLayout>
          }
        />

        <Route
          path="/pages/guides"
          element={
            <PublicLayout>
              <PublicGuidePage />
            </PublicLayout>
          }
        />

        <Route
          path="/pages/fuel-stations"
          element={
            <PublicLayout>
              <FuelStationPage />
            </PublicLayout>
          }
        />

        <Route
          path="/pages/famous-places"
          element={
            <PublicLayout>
              <FamousPlacesPage />
            </PublicLayout>
          }
        />

        <Route
          path="/pages/famous-places/:id"
          element={
            <PublicLayout>
              <FamousPlaceDetailPage />
            </PublicLayout>
          }
        />

        <Route
          path="/famous-places/:id"
          element={
            <PublicLayout>
              <FamousPlaceDetailPage />
            </PublicLayout>
          }
        />

        {/* ======================================================
            AUTH ROUTES
            ====================================================== */}

        <Route
          path="/auth/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />

        <Route
          path="/auth/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />

        {/* ======================================================
            ADMIN DASHBOARD
            ====================================================== */}

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />

        {/* ======================================================
            ADMIN MANAGEMENT ROUTES
            ====================================================== */}

        <Route
          path="/routes"
          element={
            <DashboardLayout>
              <RoutesPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/hotels"
          element={
            <DashboardLayout>
              <HotelsPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/homestays"
          element={
            <DashboardLayout>
              <HomestaysPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/restaurants"
          element={
            <DashboardLayout>
              <RestaurantsPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/activities"
          element={
            <DashboardLayout>
              <ActivitiesPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/guides"
          element={
            <DashboardLayout>
              <GuidesPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/famous-places"
          element={
            <DashboardLayout>
              <AdminFamousPlacesPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/fuel-stations"
          element={
            <DashboardLayout>
              <AdminFuelStationsPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/media"
          element={
            <DashboardLayout>
              <MediaLibraryPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/transport"
          element={
            <DashboardLayout>
              <TransportPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/workflow"
          element={
            <DashboardLayout>
              <WorkflowPage />
            </DashboardLayout>
          }
        />

        {/* ======================================================
            FALLBACK
            ====================================================== */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RootLayout>
  );
}

export default App;
