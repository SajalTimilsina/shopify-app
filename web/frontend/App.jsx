import { BrowserRouter,Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import { EditPage } from './components';
import RoutesComponent from "./Routes";


import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
  NavigationBar,
  TopBar,
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
              ]}
            />
            <div className="main-section">
              <div className="menu-section">
                <NavigationBar/>
              </div>
            <div className="content-section">
              <TopBar />
              <Routes>
                <Route path="/edit/:customerName/:listName" element={<EditPage />} />
                <Route path="/*" element={<RoutesComponent pages={pages} />} />
              </Routes>
            </div>
            </div>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
