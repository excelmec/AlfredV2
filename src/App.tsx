import "./App.css";
import Login from "./page/Login";
import CampusAmbassador from "./pages/CampusAmbassador/CampusAmbassador";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { authBaseUrl } from "./utils/url";
import { useEffect, useRef, useState } from "react";
import WebsiteStatus from "./page/WebsiteStatus";

function App() {
  const authFrameRef = useRef<HTMLIFrameElement | null>(null);
//   const tokenInterval = useRef<number | undefined>(undefined);
//   const tokenGetRetryCount = useRef<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  
  function onAuthFrameLoad() {
    // window?.addEventListener('message', (event) => {
    // 	if (event.origin !== authBaseUrl) return;
    // 	const { isLoggedin, refreshToken } = JSON.parse(event.data) as {
    // 		isLoggedin: boolean;
    // 		refreshToken: string;
    // 	};
    // 	console.log({ isLoggedin, refreshToken });
    // 	if (isLoggedin && refreshToken) {
    // 		localStorage.setItem('refreshToken', refreshToken);
    // 		setIsLoggedIn(true);
    // 	} else {
    // 		setIsLoggedIn(false);
    // 	}
    // 	setLoading(false);
    // 	clearInterval(tokenInterval.current);
    // });
    // tokenInterval.current = setInterval(() => {
    // 	console.log('sending get token message');
    // 	tokenGetRetryCount.current++;
    // 	if (tokenGetRetryCount.current > 20) {
    // 		clearInterval(tokenInterval.current);
    // 		setIsLoggedIn(false);
    // 		setLoading(false);
    // 		return;
    // 	}
    // 	authFrameRef.current?.contentWindow?.postMessage('getToken', '*');
    // }, 100);
  }

  useEffect(() => {
    try {
      const rt = localStorage.getItem("refreshToken");
	  console.log(loading);
	  

      if (rt) {
        setIsLoggedIn(true);
        setLoading(false);

		return ;
      }

      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const refreshToken = params.get("refreshToken");
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
        window.location.href = "/";
        setIsLoggedIn(true);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
    }

    return () => {
      authFrameRef.current?.removeEventListener("load", onAuthFrameLoad);
    };
  }, []);

  return (
    <>
      <iframe
        style={{ display: "none" }}
        ref={authFrameRef}
        src={`${authBaseUrl}/auth/authorize`}
        height="0px"
        width="0px"
        onLoad={onAuthFrameLoad}
      ></iframe>
      {/* {loading && <div>Loading...</div>} */}
      <AllRoutes isLoggedIn={isLoggedIn} />
    </>
  );
}

function AllRoutes({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = createBrowserRouter([
    { path: "/campus-ambassador", element: <CampusAmbassador /> },
    { path: "/login", element: <Login /> },
	{ path: "/webstatus", element: <WebsiteStatus/> },

    {
      path: "/",
      element: (
        <>
          <h1>Home</h1>
          <p>Click on the links above to navigate to the different pages.</p>
          <ul>
            <li>
              <a href="/campus-ambassador">Campus Ambassador</a>
            </li>
            
			<li>
              <a href="/login">Login</a>
            </li>
			<li>
              <a href="/webstatus">webstatus</a>
            </li>
          </ul>
        </>
      ),
    },
  ]);
  if (!isLoggedIn) {
    return <Login />;
  }

  return <RouterProvider router={router} />;
}

export default App;
