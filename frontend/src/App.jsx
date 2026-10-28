
import { useCallback, useEffect, useMemo, useState } from "react";

import DashboardFooter from "./components/DashboardFooter";
import DashboardHeader from "./components/DashboardHeader";
import MetricGrid from "./components/MetricGrid";
import OverviewSummary from "./components/OverviewSummary";
import RateLimiterCard from "./components/RateLimiterCard";
import ServicesTable from "./components/ServicesTable";
import Sidebar from "./components/Sidebar";
import TrafficChart from "./components/TrafficChart";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductsPage from "./components/ProductsPage";
import OrdersPage from "./components/OrdersPage";
import ApiExplorer from "./components/ApiExplorer";
import RateLimiterPerformanceChart from "./components/RateLimiterPerformanceChart";

import { fetchServiceHealth } from "./services/healthService";
import { getToken, logoutUser } from "./services/authService";

const initialServices = [
  { name: "API Gateway", port: ":8080", status: "Checking", latency: "—" },
  { name: "User Service", port: ":8081", status: "Checking", latency: "—" },
  { name: "Product Service", port: ":8082", status: "Checking", latency: "—" },
  { name: "Order Service", port: ":8083", status: "Checking", latency: "—" },
  { name: "Redis", port: ":6379", status: "Not monitored", latency: "—" },
];

export default function App() {
  const [token, setToken] = useState(() => getToken());
  const [authPage, setAuthPage] = useState("Login");

  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [services, setServices] = useState(initialServices);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState("");
  const [lastChecked, setLastChecked] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const checkServices = useCallback(async () => {
    setHealthLoading(true);
    setHealthError("");

    const start = performance.now();

    try {
      const health = await fetchServiceHealth();

      if (!health || typeof health !== "object" || Array.isArray(health)) {
        throw new Error("The health endpoint returned an unexpected response.");
      }

      const gatewayLatency = `${Math.round(performance.now() - start)} ms`;

      const serviceDefinitions = [
        {
          name: "API Gateway",
          status: "Online",
          latency: gatewayLatency,
        },
        {
          name: "User Service",
          status: health["user-service"] === "UP" ? "Online" : "Offline",
          latency: "—",
        },
        {
          name: "Product Service",
          status: health["product-service"] === "UP" ? "Online" : "Offline",
          latency: "—",
        },
        {
          name: "Order Service",
          status: health["order-service"] === "UP" ? "Online" : "Offline",
          latency: "—",
        },
        {
          name: "Redis",
          status: "Not monitored",
          latency: "—",
        },
      ];

      setServices((currentServices) =>
        currentServices.map((service) => {
          const updatedService = serviceDefinitions.find(
            (candidate) => candidate.name === service.name
          );

          return updatedService
            ? { ...service, ...updatedService }
            : service;
        })
      );

      setLastChecked(new Date());
    } catch (error) {
      setHealthError(
        error instanceof Error
          ? error.message
          : "Unable to fetch service health."
      );

      setServices((currentServices) =>
        currentServices.map((service) => {
          if (service.name === "API Gateway") {
            return { ...service, status: "Offline", latency: "—" };
          }

          if (service.name === "Redis") {
            return service;
          }

          return { ...service, status: "Unknown", latency: "—" };
        })
      );
    } finally {
      setHealthLoading(false);
    }
  }, []);

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || service.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [services, searchTerm, statusFilter]);

  useEffect(() => {
    if (!token) return undefined;

    const timeoutId = window.setTimeout(() => {
      void checkServices();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [token, checkServices]);

  function handleLogin(newToken) {
    setToken(newToken);
    setAuthPage("Login");
  }

  function handleLogout() {
    logoutUser();
    setToken(null);
    setAuthPage("Login");
    setActivePage("Overview");
    setSidebarOpen(false);
    setServices(initialServices);
    setSearchTerm("");
    setStatusFilter("All");
    setHealthError("");
    setLastChecked(null);
  }

  if (!token) {
    return authPage === "Register" ? (
      <Register onShowLogin={() => setAuthPage("Login")} />
    ) : (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setAuthPage("Register")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Sidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(page) => {
          setActivePage(page);
          setSidebarOpen(false);
        }}
        onLogout={handleLogout}
      />

      <main className="min-h-screen md:ml-64">
        <DashboardHeader
          activePage={activePage}
          healthLoading={healthLoading}
          onCheckHealth={checkServices}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-8">
          {activePage === "Overview" && (
            <>
              <OverviewSummary
                lastChecked={lastChecked}
                healthError={healthError}
              />

              <MetricGrid />

              <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
                <div className="min-w-0">
                  <TrafficChart />
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5">
                  <RateLimiterPerformanceChart />
                  <RateLimiterCard />
                </div>
              </section>

              <ServicesTable
                services={filteredServices}
                healthLoading={healthLoading}
                onRefresh={checkServices}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
            </>
          )}

          {activePage === "Services" && (
            <>
              <OverviewSummary
                lastChecked={lastChecked}
                healthError={healthError}
              />

              <ServicesTable
                services={filteredServices}
                healthLoading={healthLoading}
                onRefresh={checkServices}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
            </>
          )}

          {activePage === "Rate Limiter" && <RateLimiterCard />}
          {activePage === "Products" && <ProductsPage />}
          {activePage === "Orders" && <OrdersPage />}
          {activePage === "API Explorer" && <ApiExplorer />}

          <DashboardFooter />
        </div>
      </main>
    </div>
  );
}
