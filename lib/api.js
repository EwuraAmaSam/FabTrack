// Check if we're running on the client side
const isClient = typeof window !== "undefined"

const API_URL = "https://backendservice-9fbf.onrender.com/api"

// Store JWT token in memory and localStorage
let authToken = null

// Helper function to get the token
const getToken = () => {
  if (authToken) return authToken

  if (isClient) {
    const storedToken = localStorage.getItem("fabtrack_token")
    if (storedToken) {
      authToken = storedToken
      return storedToken
    }
  }

  return null
}

// Helper function to set the token
const setToken = (token) => {
  authToken = token
  if (isClient) {
    localStorage.setItem("fabtrack_token", token)
  }
}

// Helper function to clear the token
const clearToken = () => {
  authToken = null
  if (isClient) {
    localStorage.removeItem("fabtrack_token")
  }
}

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  // Skip API calls during server-side rendering
  if (!isClient) {
    console.log("Server-side rendering detected, using mock data")
    if (endpoint.includes("/auth/")) {
      return handleMockAuth(endpoint, options)
    } else if (endpoint.includes("/borrow/")) {
      return handleMockBorrow(endpoint, options)
    } else if (endpoint.includes("/equipment")) {
      return handleMockEquipment(endpoint, options)
    }
    return { message: "Mock data not implemented for this endpoint" }
  }

  const url = `${API_URL}${endpoint}`

  // Add authorization header if token exists
  const token = getToken()
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/signup")) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  try {
    console.log(`Making API request to ${endpoint}`)
    const response = await fetch(url, config)

    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}))
    //   throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
    // }

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
      } catch (error) {
        // In case the response is not JSON or there is some issue with the response body.
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    }
    

    const data = await response.json()
    console.log(`API response from ${endpoint}:`, data)
    return data
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)

    // Use mock data for all endpoints
    if (endpoint.includes("/auth/")) {
      return handleMockAuth(endpoint, options)
    } else if (endpoint.includes("/borrow/")) {
      return handleMockBorrow(endpoint, options)
    } else if (endpoint.includes("/equipment")) {
      return handleMockEquipment(endpoint, options)
    }

    throw error
  }
}

// Mock authentication for development/demo purposes
function handleMockAuth(endpoint, options) {
  console.log("Using mock authentication")

  // Mock user storage - only access localStorage on client
  const getStoredUsers = () => {
    if (isClient) {
      const stored = localStorage.getItem("fabtrack_users")
      return stored ? JSON.parse(stored) : []
    }
    return []
  }

  const saveStoredUsers = (users) => {
    if (isClient) {
      localStorage.setItem("fabtrack_users", JSON.stringify(users))
    }
  }

  const getStoredUser = () => {
    if (isClient) {
      const stored = localStorage.getItem("fabtrack_current_user")
      return stored ? JSON.parse(stored) : null
    }
    return null
  }

  const saveStoredUser = (user) => {
    if (isClient) {
      localStorage.setItem("fabtrack_current_user", JSON.stringify(user))
    }
  }

  const clearStoredUser = () => {
    if (isClient) {
      localStorage.removeItem("fabtrack_current_user")
    }
  }

  // Handle different auth endpoints
  if (endpoint === "/auth/signup" && options.method === "POST") {
    if (!isClient) return { message: "User registered successfully", userID: 5 }

    const userData = JSON.parse(options.body)
    const users = getStoredUsers()

    // Check if email already exists
    if (users.some((user) => user.email === userData.email)) {
      throw new Error("Email already registered")
    }

    const newUser = {
      id: users.length + 1,
      name: userData.name,
      email: userData.email,
      role: userData.role || "student",
      major: userData.major || "Computer Science",
      yearGroup: userData.yearGroup || 2025,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    saveStoredUsers(users)

    return { message: "User registered successfully", userID: newUser.id }
  }

  if (endpoint === "/auth/login" && options.method === "POST") {
    if (!isClient)
      return {
        message: "Login successful",
        token: "mock-jwt-token-12345",
      }

    const { email, password } = JSON.parse(options.body)
    const users = getStoredUsers()

    // For demo, accept any password but require a registered email
    const user = users.find((user) => user.email === email)

    if (!user) {
      // For demo purposes, create a new user if not found
      const newUser = {
        id: users.length + 1,
        name: email.split("@")[0].replace(/[.]/g, " "),
        email: email,
        role: email.includes("admin") ? "admin" : "student",
        major: "Computer Science",
        yearGroup: 2025,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      saveStoredUsers(users)
      saveStoredUser(newUser)

      // Generate a mock token
      const mockToken = `mock-jwt-token-${Date.now()}`
      setToken(mockToken)

      return {
        message: "Login successful",
        token: mockToken,
        user: newUser,
      }
    }

    saveStoredUser(user)

    // Generate a mock token
    const mockToken = `mock-jwt-token-${Date.now()}`
    setToken(mockToken)

    return {
      message: "Login successful",
      token: mockToken,
      user: user,
    }
  }

  if (endpoint === "/auth/logout" && options.method === "POST") {
    clearStoredUser()
    clearToken()
    return { message: "Logged out successfully" }
  }

  if (endpoint === "/auth/current-user") {
    // For server-side rendering, return null to indicate not authenticated
    if (!isClient) return null

    const user = getStoredUser()
    if (!user) {
      throw new Error("Not authenticated")
    }
    return user
  }

  if (endpoint === "/auth/edit" && options.method === "PUT") {
    if (!isClient) return { message: "User details updated successfully", user: {} }

    const userData = JSON.parse(options.body)
    const currentUser = getStoredUser()

    if (!currentUser) {
      throw new Error("Not authenticated")
    }

    const users = getStoredUsers()
    const userIndex = users.findIndex((user) => user.id === currentUser.id)

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    const updatedUser = { ...users[userIndex], ...userData }
    users[userIndex] = updatedUser

    saveStoredUsers(users)
    saveStoredUser(updatedUser)

    return { message: "User details updated successfully", user: updatedUser }
  }

  throw new Error(`Unhandled mock endpoint: ${endpoint}`)
}

// Mock function for borrow endpoints
function handleMockBorrow(endpoint, options) {
  console.log("Using mock borrow data for:", endpoint)

  // POST /api/borrow/request
  if (endpoint === "/borrow/request" && options.method === "POST") {
    const requestData = JSON.parse(options.body)
    const requestId = Date.now()

    // Store the request in localStorage
    if (isClient) {
      const requests = JSON.parse(localStorage.getItem("fabtrack_requests") || "[]")
      const currentUser = JSON.parse(localStorage.getItem("fabtrack_current_user") || "{}")

      const newRequest = {
        id: requestId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        items: requestData.items,
        status: "pending",
        requestDate: new Date().toISOString(),
        collectionDateTime: requestData.collectionDateTime,
        returnDate: null,
        purpose: requestData.purpose || "Not specified",
      }

      requests.push(newRequest)
      localStorage.setItem("fabtrack_requests", JSON.stringify(requests))
    }

    return {
      message: "Borrow request submitted successfully",
      requestId: requestId,
    }
  }

  // PUT /api/borrow/approve/{requestID}
  if (endpoint.includes("/borrow/approve/") && options.method === "PUT") {
    const requestId = Number.parseInt(endpoint.split("/").pop())
    const approvalData = JSON.parse(options.body)

    if (isClient) {
      const requests = JSON.parse(localStorage.getItem("fabtrack_requests") || "[]")
      const requestIndex = requests.findIndex((req) => req.id === requestId)

      if (requestIndex !== -1) {
        requests[requestIndex].status = "approved"
        requests[requestIndex].returnDate = approvalData.returnDate

        // Update items with serial numbers
        if (approvalData.items && Array.isArray(approvalData.items)) {
          approvalData.items.forEach((item) => {
            const itemIndex = requests[requestIndex].items.findIndex((i) => i.equipmentID === item.borrowedItemID)
            if (itemIndex !== -1) {
              requests[requestIndex].items[itemIndex].serialNumber = item.serialNumber
              requests[requestIndex].items[itemIndex].description =
                item.description || requests[requestIndex].items[itemIndex].description
              requests[requestIndex].items[itemIndex].allow = item.allow
            }
          })
        }

        localStorage.setItem("fabtrack_requests", JSON.stringify(requests))
      }
    }

    return {
      message: "Borrow request approved successfully",
      requestId: requestId,
    }
  }

  // PUT /api/borrow/return/{requestID}
  if (endpoint.includes("/borrow/return/") && options.method === "PUT") {
    const requestId = Number.parseInt(endpoint.split("/").pop())

    if (isClient) {
      const requests = JSON.parse(localStorage.getItem("fabtrack_requests") || "[]")
      const requestIndex = requests.findIndex((req) => req.id === requestId)

      if (requestIndex !== -1) {
        requests[requestIndex].status = "returned"
        localStorage.setItem("fabtrack_requests", JSON.stringify(requests))
      }
    }

    return {
      message: "Equipment returned successfully",
      requestId: requestId,
    }
  }

  // POST /api/borrow/send-reminder
  if (endpoint === "/borrow/send-reminder" && options.method === "POST") {
    return {
      message: "Reminders sent successfully",
      count: 2,
    }
  }

  // GET /api/borrow/all-requests
  if (endpoint === "/borrow/all-requests") {
    if (isClient) {
      const requests = JSON.parse(localStorage.getItem("fabtrack_requests") || "[]")
      const currentUser = JSON.parse(localStorage.getItem("fabtrack_current_user") || "{}")

      // If user is admin, return all requests
      // If user is student, return only their requests
      if (currentUser.role === "admin") {
        return requests
      } else {
        return requests.filter((req) => req.userId === currentUser.id)
      }
    }

    // Default mock data
    return [
      {
        id: "r1",
        userName: "John Doe",
        userEmail: "john.doe@ashesi.edu.gh",
        requestDate: "2023-05-10T10:30:00Z",
        returnDate: "2023-05-17T10:30:00Z",
        status: "approved",
        purpose: "Senior capstone project - Building an IoT weather station",
        items: [
          { id: "e1", name: "Arduino Uno" },
          { id: "e6", name: "Digital Multimeter" },
          { id: "e9", name: "Breadboard Kit" },
        ],
      },
      {
        id: "r2",
        userName: "Jane Smith",
        userEmail: "jane.smith@ashesi.edu.gh",
        requestDate: "2023-05-12T14:15:00Z",
        returnDate: "2023-05-19T14:15:00Z",
        status: "pending",
        purpose: "Robotics club project - Autonomous robot",
        items: [
          { id: "e2", name: "Raspberry Pi 4" },
          { id: "e10", name: "ESP32 Development Board" },
        ],
      },
    ]
  }

  // GET /api/borrow/pending-requests
  if (endpoint === "/borrow/pending-requests") {
    if (isClient) {
      const requests = JSON.parse(localStorage.getItem("fabtrack_requests") || "[]")
      const currentUser = JSON.parse(localStorage.getItem("fabtrack_current_user") || "{}")

      // Filter for pending requests
      const pendingRequests = requests.filter((req) => req.status === "pending")

      // If user is admin, return all pending requests
      // If user is student, return only their pending requests
      if (currentUser.role === "admin") {
        return pendingRequests
      } else {
        return pendingRequests.filter((req) => req.userId === currentUser.id)
      }
    }

    // Default mock data
    return [
      {
        id: "r2",
        userName: "Jane Smith",
        userEmail: "jane.smith@ashesi.edu.gh",
        requestDate: "2023-05-12T14:15:00Z",
        returnDate: "2023-05-19T14:15:00Z",
        status: "pending",
        purpose: "Robotics club project - Autonomous robot",
        items: [
          { id: "e2", name: "Raspberry Pi 4" },
          { id: "e10", name: "ESP32 Development Board" },
        ],
      },
    ]
  }

  // GET /api/borrow/{requestID}/items
  if (endpoint.includes("/borrow/") && endpoint.includes("/items")) {
    const requestId = endpoint.split("/")[2]

    if (isClient) {
      const requests = JSON.parse(localStorage.getItem("fabtrack_requests") || "[]")
      const request = requests.find((req) => req.id === Number.parseInt(requestId))

      if (request) {
        return request.items
      }
    }

    // Default mock data
    return [
      { id: "e1", name: "Arduino Uno", serialNumber: "ARD12345", status: "borrowed" },
      { id: "e6", name: "Digital Multimeter", serialNumber: "DM98765", status: "borrowed" },
    ]
  }

  // GET /api/borrow/logs
  if (endpoint === "/borrow/logs") {
    return [
      {
        id: 1,
        action: "BORROW_REQUEST",
        userId: 1,
        timestamp: "2023-05-10T10:30:00Z",
        details: "User requested Arduino Uno",
      },
      {
        id: 2,
        action: "BORROW_APPROVE",
        userId: 2,
        timestamp: "2023-05-10T11:45:00Z",
        details: "Admin approved request #1",
      },
    ]
  }

  return { message: "Mock data not implemented for this endpoint" }
}

// Mock function for equipment endpoints
function handleMockEquipment(endpoint, options) {
  console.log("Using mock equipment data for:", endpoint)

  // GET /api/equipment (get all equipment)
  if (endpoint === "/equipment" && options.method === "GET") {
    if (isClient) {
      const equipment = JSON.parse(localStorage.getItem("fabtrack_equipment") || "[]")
      return { equipmentList: equipment }
    }

    // Default mock data
    return {
      equipmentList: [
        { EquipmentID: 1, Name: "Arduino Uno" },
        { EquipmentID: 2, Name: "Raspberry Pi 4" },
        { EquipmentID: 3, Name: "Oscilloscope" },
        { EquipmentID: 4, Name: "Soldering Station" },
        { EquipmentID: 5, Name: "3D Printer" },
        { EquipmentID: 6, Name: "Digital Multimeter" },
        { EquipmentID: 7, Name: "Logic Analyzer" },
        { EquipmentID: 8, Name: "Power Supply" },
        { EquipmentID: 9, Name: "Breadboard Kit" },
        { EquipmentID: 10, Name: "ESP32 Development Board" },
      ],
    }
  }

  // POST /api/equipment (add new equipment)
  if (endpoint === "/equipment" && options.method === "POST") {
    const equipmentData = JSON.parse(options.body)

    if (isClient) {
      const equipment = JSON.parse(localStorage.getItem("fabtrack_equipment") || "[]")
      const newEquipment = {
        EquipmentID: equipment.length + 1,
        Name: equipmentData.name,
      }

      equipment.push(newEquipment)
      localStorage.setItem("fabtrack_equipment", JSON.stringify(equipment))

      return {
        message: "Equipment added successfully",
        equipment: newEquipment,
      }
    }

    return {
      message: "Equipment added successfully",
      equipment: {
        EquipmentID: 11,
        Name: equipmentData.name,
      },
    }
  }

  // GET /api/equipment/{equipmentID} (get specific equipment)
  if (endpoint.match(/\/equipment\/\d+$/) && options.method === "GET") {
    const equipmentId = Number.parseInt(endpoint.split("/").pop())

    if (isClient) {
      const equipment = JSON.parse(localStorage.getItem("fabtrack_equipment") || "[]")
      const item = equipment.find((e) => e.EquipmentID === equipmentId)

      if (item) {
        return { equipment: item }
      }
    }

    // Default mock data
    return {
      equipment: {
        EquipmentID: equipmentId,
        Name: "Mock Equipment",
        Description: "This is a mock equipment item",
        TotalQuantity: 10,
        AvailableQuantity: 5,
      },
    }
  }

  // PUT /api/equipment/{equipmentID} (update equipment)
  if (endpoint.match(/\/equipment\/\d+$/) && options.method === "PUT") {
    const equipmentId = Number.parseInt(endpoint.split("/").pop())
    const updateData = JSON.parse(options.body)

    if (isClient) {
      const equipment = JSON.parse(localStorage.getItem("fabtrack_equipment") || "[]")
      const index = equipment.findIndex((e) => e.EquipmentID === equipmentId)

      if (index !== -1) {
        equipment[index] = {
          ...equipment[index],
          Name: updateData.name || equipment[index].Name,
        }

        localStorage.setItem("fabtrack_equipment", JSON.stringify(equipment))

        return {
          message: "Equipment updated successfully",
          updatedEquipment: equipment[index],
        }
      }
    }

    return {
      message: "Equipment updated successfully",
      updatedEquipment: {
        EquipmentID: equipmentId,
        Name: updateData.name,
      },
    }
  }

  // DELETE /api/equipment/{equipmentID} (delete equipment)
  if (endpoint.match(/\/equipment\/\d+$/) && options.method === "DELETE") {
    const equipmentId = Number.parseInt(endpoint.split("/").pop())

    if (isClient) {
      const equipment = JSON.parse(localStorage.getItem("fabtrack_equipment") || "[]")
      const filteredEquipment = equipment.filter((e) => e.EquipmentID !== equipmentId)

      localStorage.setItem("fabtrack_equipment", JSON.stringify(filteredEquipment))
    }

    return {
      message: "Equipment deleted successfully",
    }
  }

  return { message: "Mock data not implemented for this endpoint" }
}

// Authentication APIs
export async function registerUser(userData) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      major: userData.major || "Computer Science",
      yearGroup: userData.yearGroup || 2025,
    }),
  })
}

export async function loginUser(email, password) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  // Store the token if login is successful
  if (response.token) {
    setToken(response.token)
  }

  return response
}

export async function logoutUser() {
  const response = await apiRequest("/auth/logout", {
    method: "POST",
  })

  // Clear the token on logout
  clearToken()

  return response
}

export async function getCurrentUser() {
  // If we don't have a token, don't even try to get the current user
  if (!getToken() && isClient) {
    throw new Error("No authentication token found")
  }

  return apiRequest("/auth/current-user")
}

export async function updateUserProfile(userData) {
  return apiRequest("/auth/edit", {
    method: "PUT",
    body: JSON.stringify(userData),
  })
}

// Equipment APIs
export async function getAllEquipment() {
  const response = await apiRequest("/equipment", {
    method: "GET",
  })

  return response.equipmentList || []
}

export async function getEquipmentById(equipmentId) {
  const response = await apiRequest(`/equipment/${equipmentId}`, {
    method: "GET",
  })

  return response.equipment
}

export async function addEquipment(equipmentData) {
  return apiRequest("/equipment", {
    method: "POST",
    body: JSON.stringify(equipmentData),
  })
}

export async function updateEquipment(equipmentId, equipmentData) {
  return apiRequest(`/equipment/${equipmentId}`, {
    method: "PUT",
    body: JSON.stringify(equipmentData),
  })
}

export async function deleteEquipment(equipmentId) {
  return apiRequest(`/equipment/${equipmentId}`, {
    method: "DELETE",
  })
}

// Borrow APIs
export async function requestBorrow(requestData) {
  return apiRequest("/borrow/request", {
    method: "POST",
    body: JSON.stringify(requestData),
  })
}

export async function getAllRequests() {
  return apiRequest("/borrow/all-requests")
}

export async function getPendingRequests() {
  return apiRequest("/borrow/pending-requests")
}

export async function approveRequest(requestId, approvalData) {
  return apiRequest(`/borrow/approve/${requestId}`, {
    method: "PUT",
    body: JSON.stringify(approvalData),
  })
}

export async function returnRequest(requestId) {
  return apiRequest(`/borrow/return/${requestId}`, {
    method: "PUT",
  })
}

export async function getRequestItems(requestId) {
  return apiRequest(`/borrow/${requestId}/items`)
}

export async function sendReminder() {
  return apiRequest("/borrow/send-reminder", {
    method: "POST",
  })
}

export async function getBorrowLogs() {
  return apiRequest("/borrow/logs")
}

// Helper function to get equipment for the UI
export async function getEquipment() {
  try {
    const equipmentList = await getAllEquipment()

    // Transform the data to match the format expected by the UI
    return equipmentList.map((item) => ({
      id: item.EquipmentID.toString(),
      name: item.Name,
      category: item.Category || "General",
      available: item.AvailableQuantity > 0,
    }))
  } catch (error) {
    console.error("Error fetching equipment:", error)

    // Return mock data as fallback
    return [
      { id: "1", name: "Arduino Uno", category: "Microcontrollers", available: true },
      { id: "2", name: "Raspberry Pi 4", category: "Single-board Computers", available: true },
      { id: "3", name: "Oscilloscope", category: "Test Equipment", available: true },
      { id: "4", name: "Soldering Station", category: "Tools", available: true },
      { id: "5", name: "3D Printer", category: "Fabrication", available: false },
      { id: "6", name: "Digital Multimeter", category: "Test Equipment", available: true },
      { id: "7", name: "Logic Analyzer", category: "Test Equipment", available: true },
      { id: "8", name: "Power Supply", category: "Power", available: true },
      { id: "9", name: "Breadboard Kit", category: "Prototyping", available: true },
      { id: "10", name: "ESP32 Development Board", category: "Microcontrollers", available: true },
    ]
  }
}

