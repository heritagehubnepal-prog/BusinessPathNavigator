// Environment Configuration Management
// This file manages UAT vs Production environment settings

const environments = {
  uat: {
    name: "UAT",
    displayName: "User Acceptance Testing Environment", 
    description: "Testing environment with relaxed security for rapid development",
    features: {
      emailVerification: false,
      adminApproval: false,
      autoApprove: true,
      storage: "memory",
      logging: "verbose",
      debugMode: true
    },
    database: {
      type: "memory",
      resetOnRestart: true
    },
    security: {
      sessionTimeout: "24h",
      passwordComplexity: "basic"
    },
    domain: process.env.UAT_DOMAIN || "uat-mycopath.replit.app"
  },
  
  production: {
    name: "PRODUCTION", 
    displayName: "Production Environment",
    description: "Live production environment with full security",
    features: {
      emailVerification: true,
      adminApproval: true,
      autoApprove: false,
      storage: "database",
      logging: "errors",
      debugMode: false
    },
    database: {
      type: "postgresql",
      resetOnRestart: false
    },
    security: {
      sessionTimeout: "8h",
      passwordComplexity: "strong"
    },
    domain: process.env.PRODUCTION_DOMAIN || "mycopath.replit.app"
  }
};

// Environment detection
function getCurrentEnvironment() {
  const envType = process.env.ENVIRONMENT_TYPE || 
                  (process.env.NODE_ENV === 'development' ? 'uat' : 'production');
  
  return environments[envType] || environments.uat;
}

function isUAT() {
  return getCurrentEnvironment().name === 'UAT';
}

function isProduction() {
  return getCurrentEnvironment().name === 'PRODUCTION';
}

export {
  environments,
  getCurrentEnvironment,
  isUAT,
  isProduction,
  
  // Environment-specific configurations  
  getStorageConfig,
  getDatabaseConfig,
  getSecurityConfig,
  getFeatureFlags
};

function getStorageConfig() {
  return getCurrentEnvironment().features.storage;
}

function getDatabaseConfig() {
  return getCurrentEnvironment().database;
}

function getSecurityConfig() {
  return getCurrentEnvironment().security;
}

function getFeatureFlags() {
  return getCurrentEnvironment().features;
}