import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { worker } from "@uidotdev/react-query-api";
import { QueryClient, QueryClientProvider, useIsFetching } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

const QueryLoader = () => {
  const isFetching = useIsFetching();

  if (isFetching) {
    return (
      <div className="query-loader">
        <p>Loading...</p>
      </div>
    )
  }

  return null;
}

new Promise((res) => setTimeout(res, 100))
  .then(() =>
    worker.start({
      quiet: true,
      onUnhandledRequest: "bypass",
    })
  )
  .then(() => {
    ReactDOM.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
            <BrowserRouter>
              <div className="container">
                <App />
                <QueryLoader />
              </div>
            </BrowserRouter>
        </QueryClientProvider>
      </React.StrictMode>,
      document.getElementById("root")
    );
  });
