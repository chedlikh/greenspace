export const login = async (credentials) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://app:8089";
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  return {
    token: data.access_token, // Use access_token as the token
    user: {
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      role: data.role,
    },
  };
};
