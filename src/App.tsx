import React, { lazy } from 'react';
import DashLayout from 'Layout/DashLayout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/Components/theme-provider';
import UserState from 'Contexts/User/UserState';
import { ApiState, merchBaseUrl, ticketsBaseUrl } from 'Contexts/Api/ApiState';

import ProtectedRoute from 'Components/Protected/ProtectedRoute';
import {
  allEventEditRoles,
  allEventViewRoles,
  specificEventViewRoles,
} from 'Hooks/Event/eventRoles';
import { ticketScanRoles } from 'Hooks/Ticket/ticketRoles';

const Contact = lazy(() => import('Pages/Contact'));
const NotFound = lazy(() => import('Pages/NotFound'));
const CaListPage = lazy(() => import('Pages/CampusAmbassador/CaList'));
const UserListPage = lazy(() => import('Pages/Users'));
const EventListPage = lazy(() => import('Pages/Events/EventList'));
const EventHeadsPage = lazy(() => import('Pages/Events/EventHeads'));
const EventDescPage = lazy(() => import('Pages/Events/EventDesc'));
const CaTeamListPage = lazy(() => import('Pages/CampusAmbassador/CaTeamList'));
const CaTeamView = lazy(() => import('Pages/CampusAmbassador/CaTeamView'));
const CaViewPage = lazy(() => import('Pages/CampusAmbassador/CaView'));
const EventEditPage = lazy(() => import('Pages/Events/EventEdit'));
const EventCreatePage = lazy(() => import('Pages/Events/EventCreate'));
const ErrorPage = lazy(() => import('Pages/Error'));
const MerchItemListPage = lazy(() => import('Pages/Merchandise/item/ItemList'));
const MerchItemViewPage = lazy(() => import('Pages/Merchandise/item/itemView'));
const MerchItemEditPage = lazy(() => import('Pages/Merchandise/item/itemEdit'));
const MerchItemCreatePage = lazy(() => import('Pages/Merchandise/item/itemCreate'));
const TestOrderPaymentPage = lazy(() => import('Pages/Merchandise/testOrder'));
const ConfirmedDeliveryOrdersListPage = lazy(
  () => import('Pages/Merchandise/ConfirmedDeliveryOrders/confirmedDeliveryOrderList'),
);
const ConfirmedPickupOrdersListPage = lazy(
  () => import('Pages/Merchandise/ConfirmedPickupOrders/confirmedPickupOrderList'),
);
const PreordersListPage = lazy(() => import('Pages/Merchandise/Preorders/preorderList'));
const MissingStockList = lazy(() => import('Pages/Merchandise/Preorders/missingStockList'));
const OrderViewPage = lazy(() => import('Pages/Merchandise/ConfirmedDeliveryOrders/orderView'));
const EventRegistrationsListPage = lazy(() => import('Pages/Events/EventRegistrations'));
const EventSchedule = lazy(() => import('Pages/Events/EventSchedule'));
const EventStatsPage = lazy(() => import('Pages/Events/EventStats'));
const TicketUserList = lazy(() => import('./Pages/Ticket/TicketUserList'));
const ProshowList = lazy(() => import('./Pages/Ticket/ProshowList'));
const TicketValidator = lazy(() => import('./Pages/Ticket/TicketValidator'));
const EventScheduleCreate = lazy(() => import('Pages/Events/EventScheduleCreate'));
const EventResults = lazy(() => import('Pages/Events/EventResults'));

function withKeys(routes: React.ReactElement[]): React.ReactElement[] {
  return routes.map((route: React.ReactElement) =>
    React.cloneElement(route, {
      key: route.key ?? String((route.props as { path?: string })?.path ?? ''),
    }),
  );
}

function App() {
  return (
    <ThemeProvider>
      <ApiState>
        <UserState>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DashLayout />}>
                <Route path="/" element={<Navigate to="/events" replace />} />

                {withKeys(UserRoutes())}

                {withKeys(ContactRoutes())}

                {withKeys(CampusAmbassadorRoutes())}

                {withKeys(EventsRoutes())}

                {withKeys(MerchRoutes())}

                {withKeys(TicketRoutes())}

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserState>
      </ApiState>
    </ThemeProvider>
  );
}

function UserRoutes() {
  return [
    <Route
      key="/users"
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
    <Route key="/ca" path="/ca" element={<Navigate to="/ca/list" replace />} />,
    <Route
      key="/ca/:ambassadorId"
      path="/ca/:ambassadorId"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
          <CaViewPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="/ca/list"
      path="/ca/list"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
          <CaListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="/ca/team"
      path="/ca/team"
      element={
        <ProtectedRoute allowedRoles={['Admin', 'CaVolunteer']}>
          <CaTeamListPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="/ca/team/:teamId/view"
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
  if (!ticketsBaseUrl)
    return [
      <Route
        path="/tickets/*"
        element={
          <ProtectedRoute allowedRoles={ticketScanRoles}>
            <ErrorPage errMsg="Tickets Features are disabled as tickets backend url is not set" />
          </ProtectedRoute>
        }
      />,
    ];

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
        <ProtectedRoute allowedRoles={ticketScanRoles}>
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
