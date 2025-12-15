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
  n8nApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    console.log(mode);
    console.log(config);
    return config;
  });

  // Response Interceptor for 401
  n8nApi.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("jwt_token");
        router.push("/login");
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
    const token = res.data.token;

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
  const callWebhook = (path: string, data = {}, method = "GET") => {
    // In development: use proxy (relative path)
    // In production: use direct N8N URL
    const url = mode === "production" ? `${n8nBaseUrl}/${path}` : `/${path}`;

    return n8nApi({
      method,
      url,
      data: method === "POST" || method === "PUT" ? data : undefined,
      params: method === "GET" ? data : undefined,
    });
  };

  const getStrategy = async (month: string) => {
    return callWebhook("webhook/strategy", { month }, "GET");
  };

  const saveStrategy = async (data: any) => {
    return callWebhook("webhook/strategy", data, "POST");
  };

  const generateContent = async (month: string) => {
    return callWebhook("webhook/generate-posts", { month }, "POST");
  };

  const publishContent = async (postId: string) => {
    return callWebhook("webhook-test/publish", { postId }, "POST");
  };

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
    saveStrategy,
    generateContent,
    publishContent,
    updatePostStatus,
    deletePost,
    registerUser,
  };
};
