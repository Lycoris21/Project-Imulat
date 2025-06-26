// Utility functions

// Remove sensitive fields from user object
export const sanitizeUser = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.passwordHash;
  return userObj;
};

// Generate pagination metadata
export const getPaginationMetadata = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNext,
    hasPrev
  };
};

// Format API response
export const formatResponse = (data, message = 'Success', meta = null) => {
  const response = {
    success: true,
    message,
    data
  };
  
  if (meta) {
    response.meta = meta;
  }
  
  return response;
};

// Format error response
export const formatError = (message, details = null) => {
  const response = {
    success: false,
    error: message
  };
  
  if (details) {
    response.details = details;
  }
  
  return response;
};

export const parseVerdict = (verdict) => {
  if (!verdict) return "Unknown";
  return verdict
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
