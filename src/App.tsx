import { CssBaseline } from '@mui/material';
import 'App.css';
import DashLayout from 'Layout/DashLayout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserState from 'Contexts/User/UserState';
import { ApiState, merchBaseUrl } from 'Contexts/Api/ApiState';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import Home from 'Pages/Home';
import Contact from 'Pages/Contact';
import NotFound from 'Pages/NotFound';
import CaListPage from 'Pages/CampusAmbassador/CaList';
import UserListPage from 'Pages/Users';
import EventListPage from 'Pages/Events/EventList';
import EventHeadsPage from 'Pages/Events/EventHeads';
import EventDescPage from 'Pages/Events/EventDesc';
import CaTeamListPage from 'Pages/CampusAmbassador/CaTeamList';
import CaTeamView from 'Pages/CampusAmbassador/CaTeamView';
import CaViewPage from 'Pages/CampusAmbassador/CaView';
import ProtectedRoute from 'Components/Protected/ProtectedRoute';
import EventEditPage from 'Pages/Events/EventEdit';
import EventCreatePage from 'Pages/Events/EventCreate';
import ErrorPage from 'Pages/Error';
import MerchItemListPage from 'Pages/Merchandise/item/ItemList';
import MerchItemViewPage from 'Pages/Merchandise/item/itemView';
import MerchItemEditPage from 'Pages/Merchandise/item/itemEdit';
import MerchItemCreatePage from 'Pages/Merchandise/item/itemCreate';
import TestOrderPaymentPage from 'Pages/Merchandise/testOrder';
import ConfirmedDeliveryOrdersListPage from 'Pages/Merchandise/ConfirmedDeliveryOrders/confirmedDeliveryOrderList';
import ConfirmedPickupOrdersListPage from 'Pages/Merchandise/ConfirmedPickupOrders/confirmedPickupOrderList';
import PreordersListPage from 'Pages/Merchandise/Preorders/preorderList';
import MissingStockList from 'Pages/Merchandise/Preorders/missingStockList';
import OrderViewPage from 'Pages/Merchandise/ConfirmedDeliveryOrders/orderView';
import EventRegistrationsListPage from 'Pages/Events/EventRegistrations';
import EventSchedule from 'Pages/Events/EventSchedule';
import {
  allEventEditRoles,
  allEventViewRoles,
  specificEventViewRoles,
} from 'Hooks/Event/eventRoles';
import EventStatsPage from 'Pages/Events/EventStats';
import TicketUserList from './Pages/Ticket/TicketUserList';
import ProshowList from './Pages/Ticket/ProshowList';
import TicketValidator from './Pages/Ticket/TicketValidator';
import EventScheduleCreate from 'Pages/Events/EventScheduleCreate';
import EventResults from 'Pages/Events/EventResults';
import { ticketAdminRoles, ticketScanRoles } from 'Hooks/Ticket/ticketRoles';

function App() {
  return (
    <div className="App">
      <CssBaseline />
      <ApiState>
        <UserState>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<DashLayout />}>
                  <Route path="/" element={<Home />} />

                  {UserRoutes().map((route) => route)}

                  {ContactRoutes().map((route) => route)}

                  {CampusAmbassadorRoutes().map((route) => route)}

                  {EventsRoutes().map((route) => route)}

                  {MerchRoutes().map((route) => route)}

                  {TicketRoutes().map((route) => route)}

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </LocalizationProvider>
        </UserState>
      </ApiState>
    </div>
  );
}

function UserRoutes() {
  return [
    <Route
      path="/users"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
          <UserListPage />
        </ProtectedRoute>
      }
    />,
  ];
}

function CampusAmbassadorRoutes() {
  return [
    <Route path="/ca" element={<Navigate to="/ca/list" />} />,
    <Route
      path="/ca/:ambassadorId"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
          <CaViewPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/ca/list"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
          <CaListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/ca/team"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
          <CaTeamListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/ca/team/:teamId/view"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
          <CaTeamView />
        </ProtectedRoute>
      }
    />,
  ];
}

function EventsRoutes() {
  return [
    /**
     * EventHead role to be given to users who need access to
     * registration list and detail of ALL events.
     * Normal event heads of each event will have 'User' role only, but
     * they can access their RESPECTIVE event's registration list.
     */
    <Route
      path="/events"
      element={
        <ProtectedRoute
          allowedRoles={[...allEventEditRoles, ...allEventViewRoles, ...specificEventViewRoles]}
        >
          <EventListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/events/view/:id"
      element={
        <ProtectedRoute
          allowedRoles={[...allEventEditRoles, ...allEventViewRoles, ...specificEventViewRoles]}
        >
          <EventDescPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/events/registrations/view/:eventId"
      element={
        <ProtectedRoute
          allowedRoles={[...allEventEditRoles, ...allEventViewRoles, ...specificEventViewRoles]}
        >
          <EventRegistrationsListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/events/results/:id"
      element={
        <ProtectedRoute
          allowedRoles={[...allEventEditRoles, ...allEventViewRoles, ...specificEventViewRoles]}
        >
          <EventResults />
        </ProtectedRoute>
      }
    />,

    <Route
      path="/events/registrations/statistics"
      element={
        <ProtectedRoute allowedRoles={[...allEventEditRoles, ...allEventViewRoles]}>
          <EventStatsPage />
        </ProtectedRoute>
      }
    />,

    <Route
      path="/events/edit/:id"
      element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <EventEditPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/events/create"
      element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <EventCreatePage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/events/heads"
      element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <EventHeadsPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/events/heads/create"
      element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <EventHeadsPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/events/schedule"
      element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <EventSchedule />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/events/schedule/create"
      element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <EventScheduleCreate />
        </ProtectedRoute>
      }
    />,
  ];
}

function MerchRoutes() {
  if (!merchBaseUrl)
    return [
      <Route
        path="/merch/*"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
            <ErrorPage errMsg="Merch Features are disabled as merch backend url is not set" />
          </ProtectedRoute>
        }
      />,
    ];

  return [
    <Route
      path="/merch/items"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
          <MerchItemListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/merch/items/create"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
          <MerchItemCreatePage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/merch/items/view/:itemId"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
          <MerchItemViewPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/merch/items/edit/:itemId"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
          <MerchItemEditPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/merch/order/testpayment"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
          <TestOrderPaymentPage />
        </ProtectedRoute>
      }
    />,

    <Route
      path="/merch/confirmed_delivery_orders"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'MerchManage', 'MerchOrderManage']}>
          <ConfirmedDeliveryOrdersListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/merch/confirmed_pickup_orders"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'MerchManage', 'MerchOrderManage']}>
          <ConfirmedPickupOrdersListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/merch/preorders"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'MerchManage', 'MerchOrderManage']}>
          <PreordersListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/merch/missing_stock"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'MerchManage']}>
          <MissingStockList />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/merch/orders/view/:orderId"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'MerchManage', 'MerchOrderManage']}>
          <OrderViewPage />
        </ProtectedRoute>
      }
    />,
  ];
}

function ContactRoutes() {
  return [
    <Route
      path="/contact"
      element={
        <ProtectedRoute>
          <Contact />
        </ProtectedRoute>
      }
    />,
  ];
}

function TicketRoutes() {
  return [
    <Route
      path="/tickets"
      element={
        <ProtectedRoute allowedRoles={ticketScanRoles}>
          <TicketUserList />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/tickets/proshows"
      element={
        <ProtectedRoute allowedRoles={ticketAdminRoles}>
          <ProshowList />
        </ProtectedRoute>
      }
    />,
    <Route
      path="/tickets/scan"
      element={
        <ProtectedRoute allowedRoles={ticketScanRoles}>
          <TicketValidator />
        </ProtectedRoute>
      }
    />,
  ];
}

export default App;
