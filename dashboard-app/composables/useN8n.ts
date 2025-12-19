import axios from "axios";

export const useN8n = () => {
  const router = useRouter();
  const config = useRuntimeConfig();

  // Axios instance for n8n Webhooks
  const n8nBaseUrl = config.public.n8nBaseUrl;
  const mode = config.public.mode;
  // We use a dummy baseURL because callWebhook overrides it.
  const n8nApi = axios.create({
    baseURL: mode === "production" ? n8nBaseUrl : "/",
    headers: { "Content-Type": "application/json" },
  });

  // Request Interceptor
  n8nApi.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      // guard in case headers object is missing
      cfg.headers = cfg.headers || {};
      cfg.headers["Authorization"] = `Bearer ${token}`;
    }
    // keep logging minimal in production
    if (mode !== "production") {
      console.log("n8n request:", cfg.method, cfg.url);
    }
    return cfg;
  });

  // Response Interceptor for 401 and 400
  n8nApi.interceptors.response.use(
    (response) => response,
    (error) => {
      // If there's a response attached, inspect the status and handle special cases
      if (error && error.response) {
        const status = error.response.status;
        if (status === 401) {
          // Unauthorized: clear token and force login
          localStorage.removeItem("jwt_token");
          router.push("/login");
        } else if (status === 400) {
          // Bad Request: redirect to the error page with details
          try {
            const message =
              (error.response.data &&
                (error.response.data.message || error.response.data.error)) ||
              error.response.statusText ||
              "Something went wrong";
            const raw = JSON.stringify(error.response.data || {});
            // encode values to be safe in query string
            router
              .push({
                path: "/error",
                query: {
                  code: String(status),
                  message: encodeURIComponent(String(message)),
                  raw: encodeURIComponent(raw),
                },
              })
              .catch(() => {});
          } catch (e) {
            // Fallback: still navigate to generic error page
            router
              .push({ path: "/error", query: { code: String(400) } })
              .catch(() => {});
          }
        }
      }
      return Promise.reject(error);
    },
  );

  const login = async (username: string, password: string) => {
    // Call n8n Webhook
    const res = await callWebhook(
      "webhook/login",
      { username, password },
      "POST",
    );
    const token = res.data?.token;

    if (!token) {
      localStorage.removeItem("jwt_token");
      router.push("/login");
      throw new Error("No token returned from login webhook");
    }

    localStorage.setItem("jwt_token", token);
    return token;
  };

  const logout = async () => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      try {
        await callWebhook("webhook/logout", { token }, "POST");
      } catch (e) {
        console.error("Logout webhook failed:", e);
      }
    }
    localStorage.removeItem("jwt_token");
    router.push("/login");
  };

  // Strategy methods
  const callWebhook = (path: string, data: any = {}, method = "GET") => {
    // In development: use proxy (relative path)
    // In production: use direct N8N URL
    let url = mode === "production" ? `${n8nBaseUrl}/${path}` : `/${path}`;
    // normalize double slashes
    url = url.replace(/([^:]\/)\/+/g, "$1");

    return n8nApi({
      method,
      url,
      data: method === "POST" || method === "PUT" ? data : undefined,
      params: method === "GET" ? data : undefined,
    });
  };

  const getStrategies = async () => {
    return callWebhook("webhook/list-strategies", {}, "GET");
  };
  // Flexible helper: accept either a string month or an object { month }
  const getStrategy = async (month: string) => {
    // If month is undefined, call without params so backend can decide default
    return callWebhook("webhook/strategy", month ? month : "", "GET");
  };

  const saveStrategy = async (data: any) => {
    return callWebhook("webhook/strategy", data, "POST");
  };

  // generateContent: accept string or object
  const generateContent = async (month: string) => {
    return callWebhook(
      "webhook/generate-posts",
      month ? { month } : {},
      "POST",
    );
  };

  /**
   * publishContent
   * Accepts flexible signatures used across the app:
   *  - publishContent(postId)
   *  - publishContent(month, postId)
   */
  const publishContent = async (month: string, postId: string) => {
    if (!month) {
      return callWebhook("webhook-test/publish", { postId }, "POST");
    } else {
      return callWebhook("webhook-test/publish", { month, postId }, "POST");
    }
  };

  /**
   * updatePostStatus
   * Supports:
   *  - updatePostStatus(month, postId, status)
   */
  const updatePostStatus = async (
    month: string,
    postId: string,
    status: string,
  ) => {
    return callWebhook(
      "webhook/post/status",
      { month, postId, status },
      "POST",
    );
  };

  /**
   * deletePost
   * Supports:
   *  - deletePost(month, postId)
   */
  const deletePost = async (month: string, postId: string) => {
    return callWebhook("webhook/post/delete", { month, postId }, "POST");
  };

  /**
   * Register a new user.
   *
   * Calls the backend auth register endpoint:
   * POST /auth/register
   * Body: { username, password }
   *
   * Returns the response data (e.g. { message: 'User created successfully' }).
   */
  const registerUser = async (username: string, password: string) => {
    const res = await callWebhook(
      "webhook-test/register",
      { username, password },
      "POST",
    );
    return res.data;
  };

  return {
    login,
    logout,
    getStrategy,
    getStrategies,
    saveStrategy,
    generateContent,
    publishContent,
    updatePostStatus,
    deletePost,
    registerUser,
  };
};
